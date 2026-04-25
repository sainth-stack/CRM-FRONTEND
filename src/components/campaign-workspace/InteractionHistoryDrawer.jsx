import { AnimatePresence, motion } from "framer-motion";
import { Bot, Clock, Mail, MessageSquare, Target, X } from "lucide-react";

import { cleanEmailReply, formatTimeAgo } from "../../pages/campaignWorkspace/workspaceUtils";

const InteractionHistoryDrawer = ({ showHistoryDM, campaign, expandedNodes, onToggleNode, onClose }) => {
  const companyName = campaign?.target_companies.find((company) => company.id === showHistoryDM?.target_company_id)?.name;

  return (
    <AnimatePresence>
      {showHistoryDM && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Mission Engagement Chain</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {showHistoryDM.name} • {companyName}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white rounded-xl text-slate-400 transition-colors shadow-sm">
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-10 space-y-10 bg-slate-50/30 relative">
              <div className="absolute left-[59px] top-10 bottom-10 w-0.5 bg-slate-200" />

              <div className="relative flex gap-8">
                <div className="z-10 bg-white w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                  <Target size={18} strokeWidth={3} />
                </div>
                <div
                  onClick={() => onToggleNode("strategy")}
                  className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex-grow cursor-pointer hover:border-brand-primary/20 transition-all"
                >
                  <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-2">Stage 0: Targeting Strategy</p>
                  <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight mb-2">
                    Strategic Alignment Identification
                  </p>
                  <p
                    className={`text-sm font-semibold text-slate-500 italic leading-relaxed ${
                      expandedNodes.includes("strategy") ? "" : "line-clamp-3"
                    }`}
                  >
                    "{showHistoryDM.similarity_score?.reason || "Lead identified through high-intent LinkedIn reconnaissance."}"
                  </p>
                </div>
              </div>

              {!showHistoryDM.logs || showHistoryDM.logs.length === 0 ? (
                <div className="relative flex gap-8 opacity-40">
                  <div className="z-10 bg-slate-100 w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <Clock size={18} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Live Engagement Response...</p>
                  </div>
                </div>
              ) : (
                [...showHistoryDM.logs].reverse().map((log, index) => {
                  const isFirstLog = index === 0;
                  return (
                    <div key={index} className="relative flex gap-8">
                      <div
                        className={`z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm shrink-0 ${
                          log.direction === "SENT"
                            ? "bg-indigo-500 border-indigo-600 text-white"
                            : "bg-emerald-500 border-emerald-600 text-white"
                        }`}
                      >
                        {log.direction === "SENT" ? (
                          isFirstLog ? <Bot size={18} strokeWidth={3} /> : <Mail size={18} strokeWidth={3} />
                        ) : (
                          <MessageSquare size={18} strokeWidth={3} />
                        )}
                      </div>
                      <div
                        className={`p-6 rounded-[24px] border shadow-sm flex-grow ${
                          log.direction === "SENT" ? "bg-indigo-50/5 border-indigo-100" : "bg-emerald-50/10 border-emerald-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p
                            className={`text-[9px] font-black uppercase tracking-widest ${
                              log.direction === "SENT" ? "text-indigo-400" : "text-emerald-500"
                            }`}
                          >
                            {log.direction === "SENT" ? (isFirstLog ? "Mission Alpha: Inaugural Signal" : "Mission Outbound") : "Signal Captured"} •{" "}
                            {formatTimeAgo(log.received_at)}
                          </p>
                          <div className="p-1 px-2 rounded-md bg-white border border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                            Sync ID: #{String(log.id).slice(-4)}
                          </div>
                        </div>
                        <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight mb-1">Subject: {log.subject}</p>
                        <p
                          className={`text-sm font-semibold leading-relaxed whitespace-pre-wrap ${
                            log.direction === "SENT" ? "text-slate-500 italic" : "text-slate-700 font-medium"
                          }`}
                        >
                          {cleanEmailReply(log.body)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InteractionHistoryDrawer;
