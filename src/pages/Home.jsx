import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Zap, Cpu, BarChart3, Mail, Globe, Settings, Users, FileText, LayoutDashboard, Terminal } from "lucide-react";
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
      description: "Our AI agents analyze LinkedIn, company context, and public signals to surface the most relevant outreach vectors.",
      icon: <Search className="w-5 h-5 text-[#00f0ff]" />,
    },
    {
      title: "Contextual Personalization",
      description: "Generate highly engaging, relevant emails tailored completely to the unique hooks of your high-value target companies.",
      icon: <Zap className="w-5 h-5 text-[#00f0ff]" />,
    },
    {
      title: "Scale Deliverability",
      description: "Manage multiple threads concurrently while ensuring enterprise compliance, multi-tenant logging, and real-time alerts.",
      icon: <Cpu className="w-5 h-5 text-[#00f0ff]" />,
    }
  ];

  return (
    <div className="flex flex-col relative overflow-hidden min-h-screen bg-[#030712] text-white selection:bg-[#00f0ff]/20 select-none">
      
      {/* Glow Effects */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00f0ff]/8 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-100px] w-[400px] h-[400px] bg-[#00d2ff]/4 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-100px] w-[500px] h-[500px] bg-[#00f0ff]/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.06] z-0" 
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Hero Section */}
      <section 
        className="relative z-10 pt-28 pb-16 px-6 max-w-7xl mx-auto w-full min-h-[90vh] flex flex-col items-center justify-center select-none"
        style={{ perspective: 1200 }}
      >
        
        {/* Futuristic Card Mockup representing the service */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateY: 0 }}
          animate={{ opacity: 1, y: 0, rotateY: [-10, 10, -10] }}
          transition={{ 
            opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            rotateY: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-full max-w-[1000px] bg-[#090d1a]/55 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.04)] backdrop-blur-xl relative group"
        >
          
          {/* Scanning cyan line effect */}
          <div
            className="absolute left-0 right-0 h-[1.5px] pointer-events-none z-20"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #00f0ff 40%, #00f0ff 60%, transparent 100%)',
              opacity: 0.6,
              animation: 'terminalScan 3.5s ease-in-out infinite',
            }}
          />
          <style>{`
            @keyframes terminalScan {
              0% { top: 0%; opacity: 0; }
              5% { opacity: 0.7; }
              50% { top: 100%; opacity: 0.4; }
              55% { opacity: 0; }
              100% { top: 0%; opacity: 0; }
            }
          `}</style>
          
          {/* Window Title Header Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-[#060a15]/80"
          >
            <div className="flex items-center gap-2">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 400 }} className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-md" />
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 400 }} className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-md" />
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: 'spring', stiffness: 400 }} className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-md" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-[#00f0ff]/80 uppercase"
            >
              <Terminal size={11} className="text-[#00f0ff]" />
              INTELLIGENT OUTREACH SERVICE: ACTIVE SESSION
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="text-[9px] font-bold tracking-widest text-[#00f0ff]/60 uppercase"
            >
              PROT-VER 4.2
            </motion.div>
          </motion.div>

          {/* Window Main Content Area */}
          <div className="p-8 md:p-14 text-center relative">
            
            {/* Soft decorative grid lines inside the mockup */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] border-r border-[#00f0ff] left-1/2 w-px" />
            
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
              className="px-3.5 py-1 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 inline-block select-none shadow-[0_0_15px_rgba(0,240,255,0.05)]"
            >
              Intelligent Outreach Infrastructure
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="landing-title text-5xl md:text-7xl font-extrabold leading-[1.08] mb-6 tracking-tighter text-white uppercase select-none"
            >
              Scale outreach<br />
              <span className="text-[#00f0ff]" style={{ textShadow: "0 0 30px rgba(0, 240, 255, 0.35)" }}>that converts</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium select-none"
            >
              Stop sending generic spam. Our AI agent researches your prospects, 
              deeply understands their business, and crafts hyper-personalized 
              emails that actually get replies.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
            >
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-10 py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(0,240,255,0.25)] hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/demo"
                    className="w-full sm:w-auto px-10 py-3.5 bg-transparent border border-zinc-800 hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Launch Trial
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/create"
                    className="w-full sm:w-auto px-10 py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(0,240,255,0.25)] hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
                  >
                    New Campaign
                  </Link>
                  <Link
                    to="/active"
                    className="w-full sm:w-auto px-10 py-3.5 bg-transparent border border-zinc-800 hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Active Campaigns
                  </Link>
                </>
              )}
            </motion.div>

            {/* Micro Telemetry stats in Hero */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-12 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-t border-zinc-900/80 pt-8"
            >
              <span className="flex items-center gap-1.5 hover:text-zinc-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 12.4k+ active prospects
              </span>
              <span className="flex items-center gap-1.5 hover:text-zinc-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" /> 98.7% deliverability rate
              </span>
              <span className="flex items-center gap-1.5 hover:text-zinc-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 4.8x reply rate
              </span>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* Built for modern outbound Section */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full text-center">
         <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 uppercase select-none tracking-tight">
            Built for modern outbound
         </h2>
         <p className="text-sm text-zinc-400 font-medium mb-16 max-w-2xl mx-auto leading-relaxed select-none">
            Fully automated research and contextual mapping of targeted company data, 
            letting you deploy precise communication protocols.
         </p>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {features.map((feature, i) => (
               <div key={i} className="bg-[#080d19]/45 border border-zinc-800/80 hover:border-[#00f0ff]/30 p-8 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-start select-none">
                  <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/20 w-11 h-11 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,240,255,0.05)] shrink-0">
                     {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 tracking-tight uppercase">{feature.title}</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed text-xs">
                     {feature.description}
                  </p>
               </div>
            ))}
         </div>
      </section>

      {/* Command & Control Dashboard Telemetry Section */}
      <section className="relative z-10 py-16 px-6 max-w-7xl mx-auto w-full flex flex-col items-center">
         <div className="text-center mb-14 max-w-3xl mx-auto">
            <span className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest mb-3 inline-block">
               Command & Control
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 uppercase tracking-tight">
               The outreach control deck
            </h2>
            <p className="text-sm text-zinc-400 font-medium max-w-lg mx-auto">
               Consolidated intelligence analytics and multi-tier campaign visibility.
            </p>
         </div>

         {/* Dashboard Mockup Table Container */}
         <div className="w-full relative max-w-[1000px]">
            
            {/* Decorative background glow behind dashboard table */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff]/5 to-transparent blur-[80px] rounded-3xl pointer-events-none -z-10" />

            <div className="bg-[#080d19]/45 border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden">
               
               <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left min-w-[700px]">
                     <thead>
                        <tr className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800/80">
                           <th className="pb-4">Campaign Name</th>
                           <th className="pb-4">Status</th>
                           <th className="pb-4">Leads</th>
                           <th className="pb-4">Avg. Response Ratio</th>
                           <th className="pb-4">Sentiment</th>
                        </tr>
                     </thead>
                     <tbody className="text-xs">
                        {[
                           { name: "Enterprise SaaS Outreach", status: "active", leads: "1,248", ratio: "24.5%", sentiment: "Positive (High)", sentimentColor: "text-emerald-400" },
                           { name: "Founders Network Q4", status: "paused", leads: "850", ratio: "22.5%", sentiment: "Neutral+", sentimentColor: "text-cyan-400" },
                           { name: "EMEA Expansion Pilot", status: "draft", leads: "200", ratio: "15.6%", sentiment: "N/A", sentimentColor: "text-zinc-500" },
                        ].map((row, i) => (
                           <tr key={i} className="text-zinc-300 border-b border-zinc-800/40 last:border-0 hover:bg-[#00f0ff]/5/20 transition-all select-none">
                              <td className="py-4.5 font-bold flex items-center gap-2.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                                 {row.name}
                              </td>
                              <td className="py-4.5">
                                 <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase border tracking-widest ${
                                    row.status === 'active' 
                                       ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                       : row.status === 'paused'
                                       ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                       : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/30'
                                 }`}>
                                    {row.status}
                                 </span>
                              </td>
                              <td className="py-4.5 text-zinc-400 font-bold">{row.leads}</td>
                              <td className="py-4.5 text-[#00f0ff] font-extrabold">{row.ratio}</td>
                              <td className={`py-4.5 font-bold ${row.sentimentColor}`}>{row.sentiment}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

            </div>
         </div>
      </section>

    </div>
  );
};

export default Home;

