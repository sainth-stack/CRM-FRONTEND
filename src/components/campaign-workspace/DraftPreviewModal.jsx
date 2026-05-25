import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lock, FileText } from "lucide-react";

const DraftPreviewModal = ({ selectedDraft, campaign, onClose }) => {
  if (!selectedDraft) {
    return <AnimatePresence />;
  }

  const dm = campaign.dms.find((decisionMaker) => decisionMaker.id === selectedDraft.decision_maker_id);
  const company = campaign.target_companies.find((targetCompany) => targetCompany.id === dm?.target_company_id);
  const email = dm?.email || `${dm?.name.toLowerCase().replace(/ /g, ".")}@${company?.website?.replace(/(https?:\/\/|www\.|\/)/g, "") || "company.com"}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-y-auto select-none">
        {/* Backdrop glass blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
        />

        {/* Premium Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ type: "spring", damping: 30, stiffness: 280 }}
          className="relative w-full max-w-[960px] bg-gradient-to-br from-[#FAF5F4] to-[#FFFDFC] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 border border-[#FAF1EE] text-slate-800 font-sans"
        >
          {/* Header */}
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
                  <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    Draft Preview
                  </span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Active Outreach Dossier for {company?.name || "Target Organization"}
                </p>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="w-10 h-10 hover:bg-[#FFF0EF] hover:text-[#FE1919] border border-[#FAF1EE] rounded-xl flex items-center justify-center text-slate-400 transition-all bg-white shadow-sm"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Scrolling Content Panel */}
          <div className="p-6 md:p-10 overflow-y-auto flex flex-col gap-6 select-text max-h-[60vh] custom-scrollbar bg-white/40">
            
            {/* Target Org & Secure Recipient Row */}
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
                <div className="relative bg-[#FAF5F4]/60 px-4 py-3.5 pr-10 rounded-xl border border-[#FAF1EE] text-sm font-semibold text-slate-500 shadow-sm flex items-center justify-between">
                  <span>{email}</span>
                  <Lock size={14} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Strategic Subject Header Container */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8192B4] uppercase tracking-widest block">
                Strategic Subject Header
              </label>
              <div className="relative bg-white p-4 pl-6 rounded-xl font-extrabold text-slate-900 border border-[#FAF1EE] shadow-sm flex items-center select-all">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FE1919] rounded-l-xl" />
                <span>{selectedDraft.subject}</span>
              </div>
            </div>

            {/* Static Narrative Protocol Body */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8192B4] uppercase tracking-widest block">
                Narrative Protocol Body
              </label>
              <div className="bg-white rounded-2xl border border-[#FAF1EE] shadow-sm p-6 md:p-8 min-h-[220px] max-h-[360px] overflow-y-auto custom-scrollbar select-all">
                <p className="font-medium text-slate-600 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {selectedDraft.body}
                </p>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="px-6 py-5 md:px-10 md:py-6 border-t border-[#FAF1EE] bg-white/70 backdrop-blur-sm flex items-center justify-end shrink-0 select-none">
            <button
              onClick={onClose}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:shadow-xl active:scale-[0.99] transition-all flex items-center gap-2"
            >
              <FileText size={13} />
              Close Preview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DraftPreviewModal;
