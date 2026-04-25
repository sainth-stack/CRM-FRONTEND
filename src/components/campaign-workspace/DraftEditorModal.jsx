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
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Executive Protocol Refinement</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stakeholder Analysis Hub</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-10 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Stakeholder</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">{dm?.name}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Organization</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">{company?.name}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 focus-within:border-brand-primary transition-colors">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 underline decoration-brand-primary/30">
                  Deployment Coordinate (Email)
                </p>
                <input
                  value={draftEditData.email}
                  onChange={(event) => onDraftEditChange({ ...draftEditData, email: event.target.value })}
                  className="w-full bg-transparent font-black text-slate-900 outline-none text-lg tracking-tight"
                />
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 focus-within:border-brand-primary transition-colors">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 underline decoration-brand-primary/30">
                  Strategic Subject Line
                </p>
                <input
                  value={draftEditData.subject}
                  onChange={(event) => onDraftEditChange({ ...draftEditData, subject: event.target.value })}
                  className="w-full bg-transparent font-black text-slate-900 outline-none text-xl tracking-tight"
                />
              </div>
              <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 focus-within:border-brand-primary transition-colors">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 underline decoration-brand-primary/30">
                  Narrative Protocol Body
                </p>
                <textarea
                  value={draftEditData.body}
                  onChange={(event) => onDraftEditChange({ ...draftEditData, body: event.target.value })}
                  className="w-full bg-transparent font-semibold text-slate-600 outline-none text-[16px] leading-relaxed min-h-[300px] resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <button
                onClick={onClose}
                className="w-full py-5 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Discard Changes
              </button>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />}
                Synchronize & Save
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DraftEditorModal;
