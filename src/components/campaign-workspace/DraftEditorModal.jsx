import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, X } from "lucide-react";

const DraftEditorModal = ({
  selectedDraft,
  campaign,
  draftEditData,
  onDraftEditChange,
  onClose,
  onSave,
  isSaving,
}) => {
  if (!selectedDraft) {
    return <AnimatePresence />;
  }

  const dm = campaign.dms.find((decisionMaker) => decisionMaker.id === selectedDraft.decision_maker_id);
  const company = campaign.target_companies.find((targetCompany) => targetCompany.id === dm?.target_company_id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[1000px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 font-sans"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surgical-navy rounded-lg flex items-center justify-center text-white font-black text-xl shadow-md">
                {(dm?.name || "TW").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded text-[9px] font-black uppercase tracking-widest inline-block mb-1">
                  Draft Refinement
                </span>
                <h3 className="text-xl font-bold text-slate-900 leading-none">{dm?.name || "Stakeholder Name"}</h3>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body content with side-by-side layout */}
          <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            
            {/* Left Sidebar - Meta Data */}
            <div className="w-full md:w-[320px] bg-[#F8FAFC] p-8 flex flex-col gap-6 overflow-y-auto border-r border-slate-100">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Target Organization
                </label>
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 shadow-sm">
                  {company?.name || "Company Name"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={draftEditData.email}
                  onChange={(event) => onDraftEditChange({ ...draftEditData, email: event.target.value })}
                  className="w-full bg-white p-3.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-surgical-navy transition-colors"
                  placeholder="name@company.com"
                />
              </div>
              
              {/* V2 Variant Selector (if applicable) */}
              {selectedDraft.variants && (
                <div className="mt-auto space-y-2 pt-8 border-t border-slate-200">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                     AI Variants
                   </label>
                  <div className="flex flex-col gap-2">
                    {Object.keys(selectedDraft.variants).map((vKey) => (
                      <button
                        key={vKey}
                        onClick={() => {
                          const variant = selectedDraft.variants[vKey];
                          onDraftEditChange({
                            ...draftEditData,
                            subject: variant.subject,
                            body: variant.body
                          });
                        }}
                        className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-left ${
                          draftEditData.subject === selectedDraft.variants[vKey].subject
                            ? "bg-surgical-navy text-white shadow-md"
                            : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {vKey}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Main Area - Editor */}
            <div className="flex-grow flex flex-col p-8 overflow-y-auto bg-white">
              <div className="space-y-6 flex-grow">
                
                {/* Subject Line */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8192B4] uppercase tracking-widest block">
                    Strategic Subject Header
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-surgical-navy rounded-l-md" />
                    <input
                      type="text"
                      value={draftEditData.subject}
                      onChange={(event) => onDraftEditChange({ ...draftEditData, subject: event.target.value })}
                      className="w-full bg-[#F8FAFC] p-4 pl-6 rounded-md font-bold text-slate-900 outline-none text-base border-none focus:bg-[#F1F5F9] transition-colors"
                      placeholder="Enter subject line..."
                    />
                  </div>
                </div>

                {/* Email Body */}
                <div className="space-y-2 flex-grow flex flex-col">
                  <label className="text-[10px] font-black text-[#8192B4] uppercase tracking-widest block">
                    Narrative Protocol Body
                  </label>
                  <textarea
                    value={draftEditData.body}
                    onChange={(event) => onDraftEditChange({ ...draftEditData, body: event.target.value })}
                    className="w-full flex-grow min-h-[250px] bg-transparent font-medium text-slate-600 outline-none text-[15px] leading-relaxed resize-none pt-2"
                    placeholder="Compose email..."
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-6 pt-6 border-t border-slate-100 mt-6">
                <button
                  onClick={onClose}
                  className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-[#1E3A8A] hover:bg-[#152e73] text-white rounded-md font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Save & Refine
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DraftEditorModal;
