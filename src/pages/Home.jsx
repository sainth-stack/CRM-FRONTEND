import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Zap, Cpu, BarChart3, Mail, Globe, Settings, Users, FileText, LayoutDashboard } from "lucide-react";

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
      icon: <Search className="w-6 h-6 text-red-600" />,
    },
    {
      title: "Contextual Personalization",
      description: "Generate highly engaging, relevant emails tailored completely to the unique hooks of your high-value target companies.",
      icon: <Zap className="w-6 h-6 text-red-600" />,
    },
    {
      title: "Scale Deliverability",
      description: "Manage multiple threads concurrently while ensuring enterprise compliance, multi-tenant logging, and real-time alerts.",
      icon: <Cpu className="w-6 h-6 text-red-600" />,
    }
  ];

  return (
    <div className="flex flex-col relative overflow-hidden min-h-screen font-sans bg-slate-50/20 select-none">
      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-24 px-6 text-center w-full min-h-[75vh] flex items-center justify-center border-b border-slate-100/60 select-none"
        style={{
          backgroundImage: 'url("/background.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] mx-auto w-full">
          <span className="px-3.5 py-1.5 bg-blue-700/40 backdrop-blur-md text-white border border-blue-600/50 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg mb-6 inline-block select-none">
            Intelligent Outreach Infrastructure
          </span>
          <h1 className="text-4xl md:text-7xl font-extrabold leading-[1.08] mb-6 tracking-tighter text-white uppercase italic drop-shadow-sm select-none">
            Scale outreach that<br />
            <span className="text-white">converts</span>
          </h1>

          <p className="text-base md:text-xl text-yellow-400 max-w-2xl mx-auto mb-12 leading-relaxed font-extrabold tracking-wide select-none drop-shadow-sm">
            Stop sending generic spam. Our AI agent researches your prospects, 
            deeply understands their business, and crafts hyper-personalized 
            emails that actually get replies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-red-500/10 hover:scale-[1.02] transition-all active:scale-[0.98] min-w-[220px]"
                >
                  Sign In
                </Link>
                <Link
                  to="/demo"
                  className="w-full sm:w-auto px-10 py-4 bg-white border border-slate-200/80 hover:border-red-100 text-slate-700 rounded-2xl font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-all shadow-sm min-w-[220px]"
                >
                  Launch Trial
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/create"
                  className="w-full sm:w-auto px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-red-500/10 hover:scale-[1.02] transition-all active:scale-[0.98] min-w-[220px]"
                >
                  New Campaign
                </Link>
                <Link
                  to="/active"
                  className="w-full sm:w-auto px-10 py-4 bg-white border border-slate-200/80 hover:border-red-100 text-slate-700 rounded-2xl font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-all shadow-sm min-w-[220px]"
                >
                  Active Campaigns
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats/Intelligence Title Section */}
      <section className="py-20 px-6 md:px-10 text-center max-w-[1400px] mx-auto w-full">
         <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight uppercase italic select-none">
            Built for modern outbound
         </h2>
         <p className="text-base md:text-lg text-slate-400 font-bold mb-16 max-w-2xl mx-auto leading-relaxed select-none">
            Fully automated research and contextual mapping of targeted company data, 
            letting you deploy precise communication protocols.
         </p>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {features.map((feature, i) => (
               <div key={i} className="bg-white border border-slate-100/80 p-8 rounded-3xl shadow-sm hover:shadow-md hover:border-red-100/40 transition-all duration-300 flex flex-col items-start select-none">
                  <div className="bg-red-50 border border-red-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm shrink-0">
                     {feature.icon}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-3 tracking-tight uppercase italic">{feature.title}</h3>
                  <p className="text-slate-500 font-bold leading-relaxed text-sm">
                     {feature.description}
                  </p>
               </div>
            ))}
         </div>
      </section>

      {/* Action Showcase Section */}
      <section className="py-16 px-6 md:px-10 bg-slate-50/10 w-full flex flex-col items-center border-t border-slate-100/80">
         <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight uppercase italic">
               The outreach control deck
            </h2>
            <p className="text-base text-slate-400 font-bold">
               Consolidated intelligence analytics and multi-tier campaign visibility.
            </p>
         </div>

         <div className="w-full max-w-[1400px] relative">
            <div className="relative bg-white border border-slate-100/80 shadow-md rounded-[36px] p-4 group overflow-hidden">
               <div className="bg-slate-50/40 rounded-[28px] overflow-hidden flex min-h-[540px]">
                  {/* Dashboard Sidebar */}
                  <div className="w-56 bg-white border-r border-slate-100/80 p-5 flex flex-col gap-6 hidden lg:flex select-none">
                     <div className="px-4 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 mb-2 select-none">
                        New Campaign
                     </div>
                     <div className="flex flex-col gap-1.5 select-none">
                        {[
                           { icon: <LayoutDashboard size={16} />, name: "Dashboard", active: false },
                           { icon: <Globe size={16} />, name: "Campaigns", active: true },
                           { icon: <FileText size={16} />, name: "Templates", active: false },
                           { icon: <Users size={16} />, name: "Contacts", active: false },
                           { icon: <BarChart3 size={16} />, name: "Analytics", active: false },
                           { icon: <Settings size={16} />, name: "Settings", active: false },
                        ].map((item, i) => (
                           <div key={i} className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${item.active ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/40'}`}>
                              {item.icon}
                              {item.name}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Dashboard Main Content */}
                  <div className="flex-grow p-8 flex flex-col gap-8">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight uppercase italic">Active Campaigns</h3>
                     </div>

                     <div className="flex flex-col lg:flex-row gap-6">
                        {/* Table Mockup */}
                        <div className="flex-grow bg-white border border-slate-100/80 rounded-3xl shadow-sm p-6 select-none">
                           <table className="w-full text-left">
                              <thead>
                                 <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-4">Campaign Title</th>
                                    <th className="pb-4">State</th>
                                    <th className="pb-4">Total</th>
                                    <th className="pb-4 text-right">Ratio</th>
                                 </tr>
                              </thead>
                              <tbody className="text-xs">
                                 {[
                                    { name: "Q4 High-Intent", status: "Running", sent: "1248", replies: "45%" },
                                    { name: "Global Enterprise", status: "Running", sent: "3215", replies: "31%" },
                                    { name: "Seed-stage Prospecting", status: "Paused", sent: "328", replies: "48%" },
                                 ].map((row, i) => (
                                    <tr key={i} className="text-slate-800 font-bold group border-b border-slate-50/50 last:border-0 hover:bg-slate-50/40 select-none">
                                       <td className="py-4 flex items-center gap-2 select-text">
                                          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                          {row.name}
                                       </td>
                                       <td className="py-4 font-black text-[9px] uppercase">
                                          <span className={`px-2.5 py-1 rounded-xl border ${row.status === 'Running' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                             {row.status}
                                          </span>
                                       </td>
                                       <td className="py-4 text-slate-400 font-bold">{row.sent}</td>
                                       <td className="py-4 text-right text-red-600 font-extrabold">{row.replies}</td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>

                        {/* Chart/Conversion Mockup */}
                        <div className="w-full lg:w-[280px] flex flex-col gap-6 select-none">
                            <div className="aspect-square bg-white border border-slate-100/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                                    <div className="absolute inset-0 rounded-full border-8 border-slate-50 border-t-red-600 animate-[spin_4s_linear_infinite]" />
                                    <div className="text-2xl font-extrabold text-red-600">48%</div>
                                </div>
                                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest leading-none">Average Response Ratio</p>
                            </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
