import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lock } from "lucide-react";

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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-[720px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col z-10 border border-slate-200"
        >
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {(dm?.name || "TW").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {dm?.name || "Stakeholder Name"}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  Draft for {company?.name || "Target Organization"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex flex-col gap-5 select-text max-h-[60vh] custom-scrollbar">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-500 flex items-center justify-between gap-2">
                  <span className="truncate">{email}</span>
                  <Lock size={13} className="text-slate-400 shrink-0" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 block">
                Subject
              </label>
              <div className="bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 select-all">
                {selectedDraft.subject}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 block">
                Message
              </label>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 min-h-[180px] max-h-[320px] overflow-y-auto custom-scrollbar select-all">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selectedDraft.body}
                </p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DraftPreviewModal;
