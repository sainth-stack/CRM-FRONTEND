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
                    <span className="text-2xl font-black text-slate-900">{selectedCompany.relevance_score || selectedCompany.similarity_score?.score}%</span>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm font-bold text-slate-500 italic text-sm leading-relaxed">
                    {selectedCompany.relevance_explanation ? `"${selectedCompany.relevance_explanation}"` : "Strategic alignment verified via target sector analysis."}
                  </div>

                  <div className="space-y-4 pt-6">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Strategic Intelligence</p>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-start gap-4 group hover:border-brand-primary/30 transition-all">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors shrink-0">
                            <Monitor size={18} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">HQ Location</p>
                            <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{selectedCompany.location || "Global Operations"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12 space-y-10">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 underline decoration-brand-primary/30 underline-offset-4">
                    Deep Research & Strategic Rational
                  </h3>
                  
                  {/* V2 Opportunity Reason */}
                  {selectedCompany.opportunity_reason && (
                    <div className="mb-8 p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10">
                      <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-3">AI Opportunity Identification</p>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                        "{selectedCompany.opportunity_reason}"
                      </p>
                    </div>
                  )}

                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 font-semibold leading-relaxed text-[15px] whitespace-pre-wrap">
                      {selectedCompany.research_summary || selectedCompany.deep_research || "No deep research data available for this entity."}
                    </p>
                  </div>

                  {/* V2 Intelligence Clusters: Pains & Services */}
                  <div className="grid grid-cols-1 gap-6 mt-10">
                    {selectedCompany.matched_pains && (
                      <div className="space-y-4">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Validated Pain Points</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCompany.matched_pains.map((pain, i) => (
                            <span key={i} className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-tight">
                              {pain}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedCompany.matched_services && (
                      <div className="space-y-4">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Service Alignment</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCompany.matched_services.map((service, i) => (
                            <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-tight">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
            </motion.div>
          </div>
        )}
    </AnimatePresence>
  );
};

export default CompanyIntelModal;
