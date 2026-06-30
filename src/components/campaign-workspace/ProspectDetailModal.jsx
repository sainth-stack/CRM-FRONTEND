import { AnimatePresence, motion } from "framer-motion";
import { X, Linkedin, Mail, Globe, Clock, Building2 } from "lucide-react";

const ensureAbsoluteUrl = (url) => {
  if (!url || url === "#" || url === "N/A" || url === "unknown") return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const Label = ({ children }) => (
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{children}</p>
);

const Card = ({ title, children }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
    <Label>{title}</Label>
    {children}
  </div>
);

export function ProspectDetailModal({ prospect, company, onClose }) {
  return (
    <AnimatePresence>
      {prospect && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-16">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl z-10 flex overflow-hidden"
            style={{ maxHeight: "85vh" }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            {/* LEFT SIDEBAR */}
            <div className="w-[240px] shrink-0 border-r border-slate-100 flex flex-col overflow-y-auto bg-slate-50/50">
              <div className="p-6 space-y-5">
                {/* Avatar + name */}
                <div className="flex flex-col gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg select-none">
                    {(prospect.name || "P").split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-snug">{prospect.name}</h2>
                    {prospect.position && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{prospect.position}</p>
                    )}
                  </div>
                </div>

                {/* Score */}
                {prospect.relevance_score != null && (
                  <div className="flex items-center justify-between py-3 border-t border-b border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Persona Fit</span>
                    <span className={`text-lg font-black ${prospect.relevance_score >= 70 ? "text-emerald-600" : prospect.relevance_score >= 45 ? "text-amber-500" : "text-rose-500"}`}>
                      {Math.round(prospect.relevance_score)}%
                    </span>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-col gap-2">
                  {prospect.linkedin && prospect.linkedin !== "N/A" && prospect.linkedin !== "unknown" && (
                    <a
                      href={ensureAbsoluteUrl(prospect.linkedin)}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#0077b5] hover:bg-[#006bb0] text-xs font-semibold text-white transition-colors"
                    >
                      <Linkedin size={13} className="shrink-0" />
                      LinkedIn Profile
                    </a>
                  )}
                  {prospect.email && (
                    <a
                      href={`mailto:${prospect.email}`}
                      className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors truncate px-1"
                    >
                      <Mail size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{prospect.email}</span>
                    </a>
                  )}
                </div>

                {/* Meta fields */}
                <div className="space-y-3 pt-1 border-t border-slate-200">
                  {company?.name && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Company</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{company.name}</p>
                    </div>
                  )}
                  {prospect.display_timezone && prospect.display_timezone !== "N/A" && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Time Zone</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{prospect.display_timezone}</p>
                    </div>
                  )}
                  {prospect.time_in_role && prospect.time_in_role !== "N/A" && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Role Tenure</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{prospect.time_in_role}</p>
                    </div>
                  )}
                  {prospect.time_at_company && prospect.time_at_company !== "N/A" && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Company Tenure</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{prospect.time_at_company}</p>
                    </div>
                  )}
                  {prospect.is_email_verified && (
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-bold uppercase tracking-wide">
                        Email Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-6">

                {/* Persona fit reasoning */}
                {prospect.relevance_explanation && (
                  <Card title="Persona Fit Reasoning">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                      "{prospect.relevance_explanation}"
                    </p>
                  </Card>
                )}

                {/* Status */}
                {prospect.status && (
                  <div>
                    <Label>Outreach Status</Label>
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                      prospect.status.includes("DRAFTED") ? "bg-amber-50 text-amber-600 border-amber-100" :
                      prospect.status.includes("SENT") ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                      (prospect.status.includes("BOOKED") || prospect.status.includes("DISCOVERY")) ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      prospect.status.includes("TERMINATED") ? "bg-rose-50 text-rose-500 border-rose-100" :
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {prospect.status.replace(/_/g, " ")}
                    </span>
                  </div>
                )}

                {/* Reply intent */}
                {(prospect.reply_intent || prospect.intent) && (
                  <Card title="Reply Intent">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      {prospect.reply_intent || prospect.intent}
                    </p>
                  </Card>
                )}

                {/* Latest reply */}
                {prospect.last_reply_snippet && (
                  <Card title="Latest Reply">
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{prospect.last_reply_snippet}"
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
