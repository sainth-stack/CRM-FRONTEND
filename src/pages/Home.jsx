import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, PenLine, Cpu, ArrowRight, TrendingUp, Users, Mail } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) return null;

  if (isLoggedIn) {
    const role = user?.role?.toUpperCase();
    if (role === "SUPER_ADMIN") return <Navigate to="/sovereign" replace />;
    if (role === "ADMIN") return <Navigate to="/management" replace />;
  }

  const features = [
    {
      title: "Targeted Analytics",
      description:
        "Our AI agents analyze LinkedIn, company context, and public signals to surface the most relevant outreach vectors.",
      icon: <Search className="w-5 h-5 text-[#00f0ff]" />,
    },
    {
      title: "Contextual Personalization",
      description:
        "Generate highly engaging, relevant emails tailored completely to the unique hooks of your high-value target companies.",
      icon: <PenLine className="w-5 h-5 text-[#00f0ff]" />,
    },
    {
      title: "Scale Deliverability",
      description:
        "Manage multiple threads concurrently while ensuring enterprise compliance, multi-tenant logging, and real-time alerts.",
      icon: <Cpu className="w-5 h-5 text-[#00f0ff]" />,
    },
  ];

  const kpis = [
    { label: "Active Prospects", value: "12,480", delta: "+18.2%", icon: Users, accent: "text-[#00f0ff]" },
    { label: "Deliverability", value: "98.7%", delta: "+1.4%", icon: Mail, accent: "text-emerald-400" },
    { label: "Reply Rate", value: "4.8x", delta: "+0.6x", icon: TrendingUp, accent: "text-[#00f0ff]" },
  ];

  const campaigns = [
    { name: "Enterprise SaaS Outreach", status: "active", leads: "1,248", ratio: "24.5%", sentiment: "Positive", sentimentColor: "text-emerald-400" },
    { name: "Founders Network Q4", status: "paused", leads: "850", ratio: "22.5%", sentiment: "Neutral+", sentimentColor: "text-cyan-400" },
    { name: "EMEA Expansion Pilot", status: "draft", leads: "200", ratio: "15.6%", sentiment: "N/A", sentimentColor: "text-zinc-500" },
  ];

  const ease = [0.16, 1, 0.3, 1];

  return (
    <div className="flex flex-col relative overflow-hidden min-h-screen bg-[#030712] text-white selection:bg-[#00f0ff]/20 select-none">
      {/* Ambient glow */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[680px] h-[680px] bg-[#00f0ff]/8 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[45%] right-[-120px] w-[420px] h-[420px] bg-[#00d2ff]/5 blur-[110px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[8%] left-[-120px] w-[520px] h-[520px] bg-[#00f0ff]/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] z-0"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* ===== HERO ===== */}
      <section className="relative z-10 pt-28 md:pt-32 pb-10 px-6 max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#00f0ff]/[0.07] text-[#00f0ff] border border-[#00f0ff]/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
          Intelligent Outreach Infrastructure
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6, ease }}
          className="landing-title text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tighter text-white"
        >
          Scale outreach
          <br />
          <span className="text-[#00f0ff]" style={{ textShadow: "0 0 34px rgba(0, 240, 255, 0.35)" }}>
            that converts
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.5 }}
          className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
        >
          Stop sending generic spam. Our AI agent researches your prospects, deeply
          understands their business, and crafts hyper-personalized emails that
          actually get replies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
        >
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="group w-full sm:w-auto px-9 py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.28)] hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
              >
                Sign In
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              {/* Launch Trial hidden for now — feature temporarily disabled.
                  Demo signup logic/routes remain intact; restore this Link to re-enable.
              <Link
                to="/demo"
                className="w-full sm:w-auto px-9 py-3.5 bg-white/[0.03] border border-zinc-800 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/[0.04] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Launch Trial
              </Link>
              */}
              <Link
                to="/contact"
                className="w-full sm:w-auto px-9 py-3.5 bg-white/[0.03] border border-zinc-800 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/[0.04] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Contact Us
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/create"
                className="group w-full sm:w-auto px-9 py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.28)] hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
              >
                Launch Campaign
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/active"
                className="w-full sm:w-auto px-9 py-3.5 bg-white/[0.03] border border-zinc-800 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/[0.04] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Active Campaigns
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* ===== PRODUCT PREVIEW CARD ===== */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto w-full pb-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease }}
          className="relative rounded-2xl border border-zinc-800/80 bg-[#0a0f1c]/70 backdrop-blur-xl shadow-[0_24px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* top hairline accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent" />

          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Outreach Control Deck</h3>
              <p className="text-[11px] text-zinc-500 font-medium">Live campaign performance overview</p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-800/40">
            {kpis.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div key={i} className="bg-[#0a0f1c]/80 px-6 py-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{kpi.label}</span>
                    <Icon size={15} className={kpi.accent} />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-extrabold text-white tracking-tight">{kpi.value}</span>
                    <span className="text-[11px] font-bold text-emerald-400 mb-1">{kpi.delta}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Campaign table */}
          <div className="overflow-x-auto custom-scrollbar border-t border-zinc-800/60">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800/60">
                  <th className="px-6 py-3.5">Campaign</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Leads</th>
                  <th className="px-6 py-3.5">Response</th>
                  <th className="px-6 py-3.5">Sentiment</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {campaigns.map((row, i) => (
                  <tr key={i} className="text-zinc-300 border-b border-zinc-800/40 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                      {row.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase border tracking-widest ${
                          row.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : row.status === "paused"
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            : "bg-zinc-800/40 text-zinc-500 border-zinc-700/30"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-bold">{row.leads}</td>
                    <td className="px-6 py-4 text-[#00f0ff] font-extrabold">{row.ratio}</td>
                    <td className={`px-6 py-4 font-bold ${row.sentimentColor}`}>{row.sentiment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto w-full text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
          Built for modern outbound
        </h2>
        <p className="text-sm md:text-base text-zinc-400 font-medium mb-14 max-w-2xl mx-auto leading-relaxed">
          Fully automated research and contextual mapping of targeted company data,
          letting you deploy precise communication at scale.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
              className="bg-[#0a0f1c]/60 border border-zinc-800/80 hover:border-[#00f0ff]/30 p-8 rounded-2xl hover:shadow-[0_0_30px_rgba(0,240,255,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
            >
              <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/20 w-11 h-11 rounded-xl flex items-center justify-center mb-6 shrink-0">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-zinc-400 font-medium leading-relaxed text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
