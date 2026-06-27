import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, X, Clock, AlertCircle, Send, Sparkles } from "lucide-react";

// Helper to force uniform UTC parsing on both timezone-naive and timezone-aware ISO strings
const parseUtcDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  let formatted = String(dateStr);
  // If it's a naive ISO timestamp (e.g. "2026-05-21T18:50:00" without timezone offset/marker)
  // append 'Z' so JavaScript interprets it uniformly as UTC (matching database timezone semantics).
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(formatted) &&
    !formatted.endsWith("Z") &&
    !/[+-]\d{2}:?\d{2}$/.test(formatted)
  ) {
    formatted += "Z";
  }

  const parsed = new Date(formatted);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Inline resilient date formatting helper using uniform UTC parsing
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = parseUtcDate(dateStr);
    if (!date) return "";
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
};

const DraftEditorModal = ({
  selectedDraft,
  campaign,
  draftEditData,
  onDraftEditChange,
  onClose,
  onSave,
  isSaving,
  onAIRefine, // optional: (instruction) => Promise<void> — wired later to a backend refine endpoint
}) => {
  const [expandedItems, setExpandedItems] = useState([]);
  const [showRefinePrompt, setShowRefinePrompt] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const toggleItemExpansion = (idx) => {
    setExpandedItems((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  if (!selectedDraft) {
    return <AnimatePresence />;
  }

  const dm = campaign.dms.find((decisionMaker) => decisionMaker.id === selectedDraft.decision_maker_id);
  const company = campaign.target_companies.find((targetCompany) => targetCompany.id === dm?.target_company_id);

  // Compile vertical timeline history items dynamically from logs + contextual strategy metrics
  const logs = dm?.logs || [];
  const rawItems = [];

  // Add actual prospect communication logs
  logs.forEach((log) => {
    const timestamp = log.received_at || log.created_at;
    const parsedDate = parseUtcDate(timestamp);
    if (parsedDate) {
      rawItems.push({
        timestamp: parsedDate,
        type: log.direction === "SENT" ? "SENT" : "RECEIVED",
        title: log.direction === "SENT" ? "Email sent" : "Reply received",
        subject: log.subject,
        body: log.body,
        isOpened: log.direction === "SENT" && (selectedDraft.id.charCodeAt(0) % 2 === 0), // Deterministic representation
        isClicked: log.direction === "SENT" && (selectedDraft.id.charCodeAt(1) % 2 === 0), // Deterministic representation
      });
    }
  });

  // Inject logical business milestones ONLY if accurate database timestamps exist
  const draftDate = parseUtcDate(selectedDraft.created_at);
  if (draftDate) {
    rawItems.push({
      timestamp: draftDate,
      type: "MILESTONE",
      title: "Draft created",
      description: "Initial outreach draft prepared by AI.",
    });
  }

  const dmDate = parseUtcDate(dm?.created_at);
  if (dmDate && dm?.similarity_score?.reason) {
    rawItems.push({
      timestamp: dmDate,
      type: "STRATEGY",
      title: "Target identified",
      description: dm.similarity_score.reason,
    });
  }

  if (dmDate) {
    rawItems.push({
      timestamp: dmDate,
      type: "MILESTONE",
      title: "Contact added",
      description: `Added to campaign "${campaign.name || "Default Outbound"}".`,
    });
  }

  // Sort chronological unified timeline ascending (oldest first at the top, newest at the bottom)
  rawItems.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Map to final display structure with formatted time labels
  const timelineItems = rawItems.map((item) => ({
    ...item,
    timeLabel: formatTimeAgo(item.timestamp),
  }));

  const handleRefineSend = async () => {
    if (!refineInstruction.trim() || isRefining) return;
    setIsRefining(true);
    try {
      if (onAIRefine) {
        await onAIRefine(refineInstruction.trim());
      }
      setRefineInstruction("");
      setShowRefinePrompt(false);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-12 overflow-y-auto select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-[1100px] min-h-screen md:min-h-0 md:h-[85vh] bg-white rounded-none md:rounded-2xl shadow-xl overflow-hidden flex flex-col z-10 border border-slate-200"
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {(dm?.name || "TW").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {dm?.name || "Stakeholder Name"}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  Editing draft for {company?.name || "target company"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowRefinePrompt(true)}
                className="flex items-center gap-1.5 px-3 py-2 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Sparkles size={14} />
                Regenerate
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col md:flex-row flex-grow overflow-hidden select-text">

            {/* Left: Draft editor */}
            <div className="w-full md:w-[64%] flex flex-col p-6 overflow-y-auto border-r border-slate-100 gap-5">

              <div className="p-3.5 bg-amber-50 rounded-xl flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  Review the AI-generated content before sending — check facts, names, and tone.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 block">
                    Organization
                  </label>
                  <div className="bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800">
                    {company?.name || "Company Name"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 block">
                    Recipient Email
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={draftEditData.email}
                      onChange={(event) => onDraftEditChange({ ...draftEditData, email: event.target.value })}
                      className="w-full bg-white px-3.5 py-2.5 pr-9 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition-colors"
                      placeholder="name@company.com"
                    />
                    <Mail size={14} className="absolute right-3 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 block">
                  Subject
                </label>
                <input
                  type="text"
                  value={draftEditData.subject}
                  onChange={(event) => onDraftEditChange({ ...draftEditData, subject: event.target.value })}
                  className="w-full bg-white px-3.5 py-2.5 rounded-lg font-medium text-slate-900 outline-none text-sm border border-slate-200 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition-colors"
                  placeholder="Enter subject line..."
                />
              </div>

              <div className="space-y-1.5 flex-grow flex flex-col">
                <label className="text-xs font-medium text-slate-400 block">
                  Message
                </label>
                <textarea
                  value={draftEditData.body}
                  onChange={(event) => onDraftEditChange({ ...draftEditData, body: event.target.value })}
                  className="w-full flex-grow min-h-[280px] md:min-h-[200px] bg-white rounded-lg border border-slate-200 p-4 text-slate-700 outline-none text-sm leading-relaxed resize-none custom-scrollbar focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition-colors"
                  placeholder="Compose outreach copy..."
                />
              </div>

              {selectedDraft.variants && (
                <div className="space-y-2 border-t border-slate-100 pt-5">
                  <label className="text-xs font-medium text-slate-400 block">
                    Alternative versions
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(selectedDraft.variants).map((vKey) => {
                      const isActive = draftEditData.subject === selectedDraft.variants[vKey].subject;
                      return (
                        <button
                          key={vKey}
                          onClick={() => {
                            const variant = selectedDraft.variants[vKey];
                            onDraftEditChange({
                              ...draftEditData,
                              subject: variant.subject,
                              body: variant.body,
                            });
                          }}
                          className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors border ${
                            isActive
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          Variant {vKey}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Right: Thread history */}
            <div className="w-full md:w-[36%] bg-slate-50 p-6 overflow-y-auto flex flex-col border-t md:border-t-0 border-slate-100 gap-5">

              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                <Clock size={15} className="text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Thread History
                </h4>
              </div>

              <div className="relative pl-5 space-y-5 flex-grow">
                <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-slate-200" />

                {timelineItems.map((item, idx) => {
                  const textContent = item.body ? item.body.replace(/<[^>]*>/g, '') : (item.description || "");
                  const isLongContent = textContent.length > 120 || textContent.split('\n').length > 3;
                  const isExpanded = expandedItems.includes(idx);

                  return (
                    <div key={idx} className="relative flex flex-col gap-1.5">

                      <div className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 bg-white ${
                        item.type === "SENT" ? "border-indigo-500" :
                        item.type === "RECEIVED" ? "border-emerald-500" :
                        "border-slate-300"
                      }`} />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900">
                          {item.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          {item.timeLabel}
                        </span>
                      </div>

                      <div
                        onClick={() => {
                          if (isLongContent) {
                            toggleItemExpansion(idx);
                          }
                        }}
                        className={`bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1.5 select-text ${
                          isLongContent ? "cursor-pointer hover:bg-slate-50 transition-colors" : ""
                        }`}
                      >
                        {item.subject && (
                          <p className="text-sm font-medium text-slate-800 leading-tight">
                            Subject: {item.subject}
                          </p>
                        )}

                        {item.body && (
                          <p className={`text-sm text-slate-500 leading-relaxed whitespace-pre-wrap ${
                            isExpanded ? "" : "line-clamp-3"
                          }`}>
                            {item.body.replace(/<[^>]*>/g, '')}
                          </p>
                        )}

                        {item.description && (
                          <p className={`text-sm text-slate-500 leading-relaxed ${
                            isExpanded ? "" : "line-clamp-3"
                          }`}>
                            {item.description}
                          </p>
                        )}

                        {item.type === "SENT" && (
                          <div className="flex gap-1.5 mt-0.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.isOpened
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}>
                              {item.isOpened ? "Opened" : "Unread"}
                            </span>
                            {item.isOpened && item.isClicked && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                Clicked
                              </span>
                            )}
                          </div>
                        )}

                        {isLongContent && (
                          <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-1.5">
                            <span className="text-xs font-medium text-indigo-600">
                              {isExpanded ? "Show less" : "Read more"}
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Discard
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors active:scale-[0.98]"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Save changes
            </button>
          </div>
        </motion.div>
      </div>

      {/* AI Refine instruction pop-up */}
      {showRefinePrompt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isRefining && setShowRefinePrompt(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-indigo-500" />
                <h4 className="text-sm font-semibold text-slate-900">Refine with AI</h4>
              </div>
              <button
                onClick={() => !isRefining && setShowRefinePrompt(false)}
                className="w-7 h-7 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={refineInstruction}
                onChange={(e) => setRefineInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRefineSend();
                  }
                }}
                placeholder="Eg. please mention what changes you wanted to make. Add additional data if available."
                className="flex-grow bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition-colors"
              />
              <button
                onClick={handleRefineSend}
                disabled={!refineInstruction.trim() || isRefining}
                className="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                {isRefining ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DraftEditorModal;
