import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Linkedin, Mail, Monitor, PhoneCall, X } from "lucide-react";

import CompanyIdentityBadge from "./CompanyIdentityBadge";
import { ensureAbsoluteUrl } from "../../pages/campaignWorkspace/workspaceUtils";

const CompanyIntelModal = ({ selectedCompany, onClose }) => {
  return (
    <AnimatePresence>
      {selectedCompany && (
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
            className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all z-10"
            >
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 space-y-10 border-r border-slate-100 bg-slate-50/50">
                <CompanyIdentityBadge
                  companyName={selectedCompany.name}
                  website={selectedCompany.website}
                  size="lg"
                />
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 leading-tight uppercase italic">{selectedCompany.name}</h2>
                  <a
                    href={ensureAbsoluteUrl(selectedCompany.website)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-brand-primary font-black text-sm hover:underline"
                  >
                    {selectedCompany.website} <ExternalLink size={16} />
                  </a>
                </div>

                <div className="space-y-6 pt-10 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Matching Protocol</span>
                    <span className="text-2xl font-black text-slate-900">{selectedCompany.similarity_score?.score}%</span>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm font-bold text-slate-500 italic text-sm leading-relaxed">
                    "{selectedCompany.similarity_score?.reason}"
                  </div>

                  <div className="space-y-4 pt-6">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Strategic Intelligence</p>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 group hover:border-brand-primary/30 transition-all">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                          <Monitor size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">HQ Location</p>
                          <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{selectedCompany.location || "N/A"}</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 group hover:border-brand-primary/30 transition-all">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Corporate Email</p>
                          <p className="text-xs font-black text-slate-700 tracking-tight lowercase">{selectedCompany.contact_email || "N/A"}</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 group hover:border-brand-primary/30 transition-all">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                          <PhoneCall size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Direct Line</p>
                          <p className="text-xs font-black text-slate-700 tracking-tight">{selectedCompany.contact_number || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12 space-y-10">
                <div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 underline decoration-brand-primary/30 underline-offset-4">
                    Deep Research & Strategic Rational
                  </h3>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 font-semibold leading-relaxed text-[15px] whitespace-pre-wrap">
                      {selectedCompany.deep_research}
                    </p>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 flex items-center gap-4">
                  <a
                    href={ensureAbsoluteUrl(selectedCompany.linkedin)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-grow flex items-center justify-center gap-3 py-4 bg-[#0077b5] text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-blue-500/20"
                  >
                    <Linkedin size={20} /> LinkedIn Protocol
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CompanyIntelModal;
