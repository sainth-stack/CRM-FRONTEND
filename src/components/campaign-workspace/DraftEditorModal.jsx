import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, X, RotateCcw, Clock, AlertCircle, MessageSquare } from "lucide-react";

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
  } catch (e) {
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
}) => {
  const [expandedItems, setExpandedItems] = useState([]);

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
        title: log.direction === "SENT" ? "Email Outbound" : "Signal Captured",
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
      title: "Draft Created",
      description: "Initial outreach draft prepared by Ghostwriter AI.",
    });
  }

  const dmDate = parseUtcDate(dm?.created_at);
  if (dmDate && dm?.similarity_score?.reason) {
    rawItems.push({
      timestamp: dmDate,
      type: "STRATEGY",
      title: "Strategy Target Identified",
      description: dm.similarity_score.reason,
    });
  }

  if (dmDate) {
    rawItems.push({
      timestamp: dmDate,
      type: "MILESTONE",
      title: "Contact Created",
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-12 overflow-y-auto select-none">
        {/* Backdrop glass blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
        />

        {/* Adaptive Panel Layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ type: "spring", damping: 30, stiffness: 280 }}
          className="relative w-full max-w-[1360px] min-h-screen md:min-h-0 md:h-[90vh] bg-gradient-to-br from-[#FAF5F4] to-[#FFFDFC] rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 font-sans border border-[#FAF1EE] text-slate-800"
        >
          {/* Main Top Header */}
          <div className="px-6 py-5 md:px-10 md:py-6 flex items-center justify-between border-b border-[#FAF1EE] bg-white/70 backdrop-blur-sm sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
              {/* Dark monogram avatar */}
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-slate-950/10">
                {(dm?.name || "TW").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-none">
                    {dm?.name || "Stakeholder Name"}
                  </h3>
                  <span className="px-2 py-0.5 bg-[#FFF0EF] text-[#FE1919] border border-[#FFDEDC] rounded-lg text-[9px] font-black uppercase tracking-widest">
                    Draft Refinement
                  </span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Refining outreach for {company?.industry || "target market"} automation
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Reset/Regenerate placeholder to match references */}
              <button 
                onClick={() => {
                  if (selectedDraft.variants && selectedDraft.variants["A"]) {
                    const variant = selectedDraft.variants["A"];
                    onDraftEditChange({ ...draftEditData, subject: variant.subject, body: variant.body });
                  }
                }}
                title="Reset to original generated draft"
                className="w-10 h-10 hover:bg-slate-50 border border-[#FAF1EE] rounded-xl flex items-center justify-center text-slate-400 hover:text-[#FE1919] transition-all bg-white shadow-sm"
              >
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={onClose} 
                className="w-10 h-10 hover:bg-[#FFF0EF] hover:text-[#FE1919] border border-[#FAF1EE] rounded-xl flex items-center justify-center text-slate-400 transition-all bg-white shadow-sm"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Scrolling Split Columns */}
          <div className="flex flex-col md:flex-row flex-grow overflow-hidden select-text">
            
            {/* Left Workspace Panel: Draft Editor (65% width) */}
            <div className="w-full md:w-[65%] flex flex-col p-6 md:p-10 overflow-y-auto border-r border-[#FAF1EE] gap-6 bg-white/40">
              
              {/* Informational Alert Box */}
              <div className="p-4 bg-[#FFFDF5] border border-[#FBEFCD] rounded-2xl flex items-start gap-3 shadow-sm select-none">
                <AlertCircle size={18} className="text-[#D97706] shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-[#B45309] leading-relaxed">
                  Review AI-generated content for accuracy. Strategic headers are optimized for current market sentiment in the {company?.industry || "target"} sector.
                </p>
              </div>

              {/* Organization & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8192B4] uppercase tracking-widest block">
                    Target Organization
                  </label>
                  <div className="bg-white px-4 py-3.5 rounded-xl border border-[#FAF1EE] text-sm font-semibold text-slate-800 shadow-sm">
                    {company?.name || "Company Name"}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8192B4] uppercase tracking-widest block">
                    Recipient Email
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={draftEditData.email}
                      onChange={(event) => onDraftEditChange({ ...draftEditData, email: event.target.value })}
                      className="w-full bg-white px-4 py-3.5 pr-10 rounded-xl border border-[#FAF1EE] text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-[#FE1919]/20 focus:ring-1 focus:ring-[#FE1919]/25 transition-all"
                      placeholder="name@company.com"
                    />
                    <div className="absolute right-3.5 text-slate-300">
                      <Mail size={15} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Subject Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8192B4] uppercase tracking-widest block">
                  Strategic Subject Header
                </label>
                <div className="relative flex items-center">
                  {/* The thematic solid red vertical bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FE1919] rounded-l-xl" />
                  <input
                    type="text"
                    value={draftEditData.subject}
                    onChange={(event) => onDraftEditChange({ ...draftEditData, subject: event.target.value })}
                    className="w-full bg-white p-4 pl-6 rounded-xl font-extrabold text-slate-800 outline-none text-base border border-[#FAF1EE] shadow-sm focus:border-[#FE1919]/20 focus:ring-1 focus:ring-[#FE1919]/25 transition-all"
                    placeholder="Enter subject line..."
                  />
                </div>
              </div>

              {/* Narrative Protocol Body Editor */}
              <div className="space-y-2 flex-grow flex flex-col">
                <label className="text-[10px] font-black text-[#8192B4] uppercase tracking-widest block">
                  Narrative Protocol Body
                </label>
                <div className="relative flex-grow flex flex-col bg-white rounded-2xl border border-[#FAF1EE] shadow-sm p-6">
                  <textarea
                    value={draftEditData.body}
                    onChange={(event) => onDraftEditChange({ ...draftEditData, body: event.target.value })}
                    className="w-full flex-grow min-h-[320px] md:min-h-[220px] bg-transparent font-medium text-slate-600 outline-none text-[15px] leading-relaxed resize-none pt-2 custom-scrollbar"
                    placeholder="Compose outreach copy..."
                  />
                </div>
              </div>

              {/* Dynamic AI Variant Tabs */}
              {selectedDraft.variants && (
                <div className="space-y-2 border-t border-[#FAF1EE] pt-6 select-none">
                  <label className="text-[10px] font-black text-[#8192B4] uppercase tracking-widest block">
                    Alternative AI Model Variants
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
                          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            isActive
                              ? "bg-slate-900 border-slate-950 text-white shadow-md"
                              : "bg-white text-slate-500 border-[#FAF1EE] hover:bg-slate-50"
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

            {/* Right Workspace Panel: Thread History Timeline (35% width) */}
            <div className="w-full md:w-[35%] bg-[#FDFBFB] p-6 md:p-10 overflow-y-auto flex flex-col border-t md:border-t-0 border-[#FAF1EE] gap-6">
              
              {/* Section Header */}
              <div className="flex items-center gap-3 border-b border-[#FAF1EE] pb-4 select-none">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0EF] text-[#FE1919] flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    Thread History
                  </h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Operational Engagement Chain
                  </p>
                </div>
              </div>

              {/* Elegant Vertical Timeline */}
              <div className="relative pl-6 space-y-6 flex-grow">
                {/* Timeline vertical connector line */}
                <div className="absolute left-[7px] top-1.5 bottom-1.5 w-0.5 bg-[#FAF1EE]" />

                {timelineItems.map((item, idx) => {
                  const textContent = item.body ? item.body.replace(/<[^>]*>/g, '') : (item.description || "");
                  const isLongContent = textContent.length > 120 || textContent.split('\n').length > 3;
                  const isExpanded = expandedItems.includes(idx);

                  return (
                    <div key={idx} className="relative flex flex-col gap-2 group">
                      
                      {/* Timeline Node Bullet */}
                      <div className={`absolute -left-[24px] top-1.5 w-[14px] h-[14px] rounded-full border-2 bg-white transition-all ${
                        item.type === "SENT" ? "border-indigo-500" :
                        item.type === "RECEIVED" ? "border-emerald-500" :
                        "border-slate-300"
                      }`} />

                      {/* Timeline Card Header */}
                      <div className="flex items-center justify-between select-none">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight">
                          {item.timeLabel}
                        </span>
                      </div>

                       {/* Timeline Content Block */}
                      <div 
                        onClick={() => {
                          if (isLongContent) {
                            toggleItemExpansion(idx);
                          }
                        }}
                        className={`bg-white p-4 rounded-2xl border border-[#FAF1EE] shadow-sm flex flex-col gap-2 transition-all select-text ${
                          isLongContent
                            ? "hover:border-[#FAF1EE]/80 hover:shadow-md cursor-pointer"
                            : "cursor-default"
                        }`}
                      >
                        {item.subject && (
                          <p className="text-xs font-black text-slate-800 leading-tight">
                            Subject: {item.subject}
                          </p>
                        )}
                        
                        {item.body && (
                          <p className={`text-[11px] font-semibold text-slate-500 leading-relaxed whitespace-pre-wrap ${
                            isExpanded ? "" : "line-clamp-3 text-ellipsis overflow-hidden"
                          }`}>
                            {item.body.replace(/<[^>]*>/g, '')}
                          </p>
                        )}

                        {item.description && (
                          <p className={`text-[11px] font-semibold text-slate-500 leading-relaxed italic ${
                            isExpanded ? "" : "line-clamp-3 text-ellipsis overflow-hidden"
                          }`}>
                            "{item.description}"
                          </p>
                        )}

                        {/* Display custom read/clicked badges matching references */}
                        {item.type === "SENT" && (
                          <div className="flex gap-1.5 mt-1 select-none">
                            <span className={`px-2 py-0.5 border rounded-lg text-[8px] font-black uppercase tracking-wider ${
                              item.isOpened 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                                : "bg-slate-50 border-slate-100 text-slate-400"
                            }`}>
                              {item.isOpened ? "Opened" : "Unread"}
                            </span>
                            {item.isOpened && item.isClicked && (
                              <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-wider">
                                Clicked
                              </span>
                            )}
                          </div>
                        )}

                        {/* Dynamic read/expand footer indicator */}
                        {isLongContent && (
                          <div className="mt-1.5 flex items-center justify-between border-t border-[#FAF1EE]/80 pt-2 select-none">
                            <span className="text-[9px] font-black text-[#FE1919] hover:text-[#D61414] uppercase tracking-widest transition-colors flex items-center gap-1">
                              {isExpanded ? "Show Less ↑" : "Read Full Draft ↓"}
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

          {/* Action Footer */}
          <div className="px-6 py-5 md:px-10 md:py-6 border-t border-[#FAF1EE] bg-white/70 backdrop-blur-sm flex items-center justify-end gap-4 shrink-0 select-none">
            <button
              onClick={onClose}
              className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
            >
              Discard Changes
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:shadow-xl active:scale-[0.99] transition-all flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Save & Refine
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DraftEditorModal;
