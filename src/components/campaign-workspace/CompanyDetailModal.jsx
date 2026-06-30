import { AnimatePresence, motion } from "framer-motion";
import { X, Globe, Linkedin, Mail, PhoneCall, AlertCircle, ShieldX } from "lucide-react";

const ensureAbsoluteUrl = (url) => {
  if (!url || url === "#" || url === "N/A" || url === "unknown") return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const PLACEHOLDER_VALUES = new Set([
  "none evidenced", "none stated", "none", "n/a", "not stated",
  "no pain signals", "no signals", "not applicable", "unknown",
  "needs discovery", "unclear — no evidenced need", "unclear",
]);

const cleanList = (arr) => (arr || []).filter(v => v && !PLACEHOLDER_VALUES.has(String(v).trim().toLowerCase()));

const Label = ({ children }) => (
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{children}</p>
);

const Card = ({ title, children }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
    <Label>{title}</Label>
    {children}
  </div>
);

const CHECK_LABEL = { location: "Location", size: "Employee Size", industry: "Industry" };
const VERDICT_STYLE = {
  REJECTED:    { bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200" },
  APPROVED:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  INCONCLUSIVE:{ bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
};

function parseScreenerReasoning(text) {
  if (!text?.startsWith("[Pre-screened]")) return null;

  const inner = text.slice("[Pre-screened] ".length);
  const failOnMatch = inner.match(/^FAIL on: ([^.]+)\.\s*/);
  const failedChecks = failOnMatch ? failOnMatch[1].split(",").map(s => s.trim()) : [];
  const rest = failOnMatch ? inner.slice(failOnMatch[0].length) : inner;

  const segments = rest.split(" | ");
  const checks = segments.map(seg => {
    const colonIdx = seg.indexOf(": ");
    if (colonIdx === -1) return { name: seg, verdict: null, main: "", bullets: [] };
    const name = seg.slice(0, colonIdx);
    const evidence = seg.slice(colonIdx + 2);
    const lines = evidence.split("\n");
    const firstLine = lines[0] || "";

    // Parse "DECISION: REJECTED — <reason>" from the first line
    const verdictMatch = firstLine.match(/^DECISION:\s*(\w+)\s*[—–-]+\s*(.*)/);
    const verdict = verdictMatch ? verdictMatch[1].toUpperCase() : null;
    const main = verdictMatch ? verdictMatch[2] : firstLine;

    const bullets = lines.slice(1)
      .filter(l => l.trim().startsWith("-"))
      .map(l => {
        const cleaned = l.replace(/^-\s*/, "").trim();
        const labelMatch = cleaned.match(/^([^:]{1,30}?):\s(.+)/s);
        return labelMatch
          ? { label: labelMatch[1], content: labelMatch[2] }
          : { label: null, content: cleaned };
      });

    return { name: CHECK_LABEL[name] || name, verdict, main, bullets };
  });

  return { failedChecks, checks };
}

function ScreenerReasoning({ text }) {
  const parsed = parseScreenerReasoning(text);

  if (!parsed) {
    // Plain ICP reasoning (non-pre-screened) — just render as text
    return (
      <Card title="ICP Reasoning">
        <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
      </Card>
    );
  }

  const { failedChecks, checks } = parsed;

  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ShieldX size={14} className="text-rose-500 shrink-0" />
        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Pre-screen Rejection</span>
        <div className="flex gap-1.5 ml-1">
          {failedChecks.map(c => (
            <span key={c} className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-[10px] font-bold uppercase tracking-wide">
              {CHECK_LABEL[c] || c}
            </span>
          ))}
        </div>
      </div>

      {/* Per-check sections */}
      {checks.map((check, i) => {
        const vstyle = VERDICT_STYLE[check.verdict] || VERDICT_STYLE.REJECTED;
        return (
          <div key={i} className="space-y-2">
            {checks.length > 1 && (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{check.name}</p>
            )}

            {/* Verdict badge + reason */}
            {check.verdict && (
              <div className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${vstyle.bg} ${vstyle.border}`}>
                <span className={`text-[10px] font-black uppercase tracking-wide shrink-0 mt-0.5 ${vstyle.text}`}>
                  {check.verdict}
                </span>
                <span className={`text-xs leading-relaxed ${vstyle.text}`}>{check.main}</span>
              </div>
            )}
            {!check.verdict && check.main && (
              <p className="text-sm text-slate-700 leading-relaxed">{check.main}</p>
            )}

            {/* Signal bullets */}
            {check.bullets.length > 0 && (
              <ul className="space-y-1.5 pl-1">
                {check.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span>
                      {b.label && (
                        <span className="font-semibold text-slate-700">{b.label}: </span>
                      )}
                      {b.content}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CompanyDetailModal({ company, onClose }) {
  return (
    <AnimatePresence>
      {company && (() => {
        const co = company;
        const score = co.relevance_score || 0;
        const isRejected = co.status === "REJECTED";
        const meddpicc = co.v2_intel?.meddpicc || {};
        const cleanPains = cleanList(co.matched_pains);
        const cleanSvcs = cleanList(co.matched_services);
        const cleanHooks = cleanList([...(co.pain_hooks || []), ...(co.growth_hooks || []), ...(co.news_hooks || [])]);
        const initials = (co.name || "C").split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2);
        const scoreClr = score >= 70 ? "text-emerald-600" : score >= 45 ? "text-amber-500" : "text-rose-500";

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-16">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl z-10 flex overflow-hidden"
              style={{ maxHeight: "85vh" }}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>

              {/* ── LEFT SIDEBAR ── */}
              <div className="w-[258px] shrink-0 border-r border-slate-100 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50/50">
                <div className="p-6 space-y-5">
                  {/* Avatar + name */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-base select-none shrink-0">
                        {initials}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${isRejected ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                        {isRejected ? "Disqualified" : "Qualified"}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 leading-snug">{co.name}</h2>
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-between py-3 border-t border-b border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Alignment Score</span>
                    <span className={`text-lg font-black ${scoreClr}`}>{score}%</span>
                  </div>

                  {/* Links */}
                  <div className="flex flex-col gap-2">
                    {co.website && (
                      <a href={ensureAbsoluteUrl(co.website)} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                        <Globe size={13} className="shrink-0" />
                        Visit Website
                      </a>
                    )}
                    {co.linkedin && (
                      <a href={ensureAbsoluteUrl(co.linkedin)} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#0077b5] hover:bg-[#006bb0] text-xs font-semibold text-white transition-colors">
                        <Linkedin size={13} className="shrink-0" />
                        LinkedIn Profile
                      </a>
                    )}
                    {co.contact_email && (
                      <a href={`mailto:${co.contact_email}`}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors truncate">
                        <Mail size={13} className="shrink-0 text-slate-400" />
                        <span className="truncate">{co.contact_email}</span>
                      </a>
                    )}
                    {co.contact_number && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <PhoneCall size={13} className="shrink-0 text-slate-400" />
                        {co.contact_number}
                      </div>
                    )}
                  </div>

                  {/* Firmographics */}
                  {(co.location || co.company_type || co.employee_count || co.revenue_range) && (
                    <div className="space-y-3 pt-1 border-t border-slate-200">
                      {[
                        { label: "Location", value: co.location },
                        { label: "Vertical", value: co.company_type },
                        { label: "Headcount", value: co.employee_count },
                        { label: "Revenue", value: co.revenue_range },
                      ].filter(r => r.value).map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Buyer Roles */}
                  {(meddpicc.economic_buyer || meddpicc.champion) && (
                    <div className="space-y-3 pt-1 border-t border-slate-200">
                      {meddpicc.economic_buyer && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Economic Buyer</p>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{meddpicc.economic_buyer}</p>
                        </div>
                      )}
                      {meddpicc.champion && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Champion</p>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{meddpicc.champion}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT CONTENT ── */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 space-y-7">

                  {/* ICP reasoning — top */}
                  {co.relevance_explanation && (
                    <ScreenerReasoning text={co.relevance_explanation} />
                  )}

                  {/* Rejection reason */}
                  {isRejected && co.rejection_reason && (
                    <div className="flex gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl">
                      <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <Label>Disqualification Reason</Label>
                        <p className="text-sm text-rose-700 font-medium leading-relaxed">{co.rejection_reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Opportunity signal */}
                  {co.opportunity_reason && (
                    <Card title="Opportunity Signal">
                      <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{co.opportunity_reason}"</p>
                    </Card>
                  )}

                  {/* Research summary */}
                  <Card title="Company Overview">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                      {co.research_summary || co.deep_research || "No research data available."}
                    </p>
                  </Card>

                  {/* Pain signals */}
                  {cleanHooks.length > 0 && (
                    <Card title="Signals & Challenges">
                      <ul className="space-y-2">
                        {cleanHooks.map((h, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Pain points */}
                  {cleanPains.length > 0 && (
                    <Card title="Validated Pain Points">
                      <div className="flex flex-wrap gap-2">
                        {cleanPains.map((p, i) => (
                          <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-semibold">{p}</span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Service alignment */}
                  {cleanSvcs.length > 0 && (
                    <Card title="Service Alignment">
                      <div className="flex flex-wrap gap-2">
                        {cleanSvcs.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-semibold">{s}</span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Value metrics */}
                  {meddpicc.metrics && !PLACEHOLDER_VALUES.has(String(meddpicc.metrics).trim().toLowerCase()) && (
                    <Card title="Value Metrics">
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{meddpicc.metrics}</p>
                    </Card>
                  )}

                  {/* Evidence of need */}
                  {meddpicc.need_evidence && !PLACEHOLDER_VALUES.has(String(meddpicc.need_evidence).trim().toLowerCase()) && (
                    <Card title="Evidence of Need">
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{meddpicc.need_evidence}</p>
                    </Card>
                  )}

                </div>
              </div>
            </motion.div>
          </div>
        );
      })()}
    </AnimatePresence>
  );
}
