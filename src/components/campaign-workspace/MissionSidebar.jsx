import React from 'react';
import { 
  LayoutDashboard, Globe, Mail, History, 
  Settings, LogOut, ShieldCheck, FileBarChart, PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MissionSidebar = ({ activeTab, setActiveTab, campaignName }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "research", label: "Research Intel", icon: Globe },
    { id: "monitor", label: "Outreach Monitor", icon: Mail },
    { id: "history", label: "Discovery Calls", icon: PhoneCall },
    { id: "report", label: "Report", icon: FileBarChart },
  ];

  return (
    <aside className="w-64 bg-surgical-navy flex flex-col h-screen shrink-0 border-r border-white/5 select-none overflow-hidden">
      {/* Sidebar Header: Mission Context */}
      <div className="p-8 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-surgical-cobalt flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={18} />
          </div>
          <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Mission Active</span>
        </div>
        <h2 className="text-white font-black text-lg uppercase tracking-tight italic truncate" title={campaignName}>
          {campaignName || "Tactical Unit"}
        </h2>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-grow py-8 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeTab === item.id
                ? "bg-white/10 text-white shadow-xl ring-1 ring-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon size={18} className={activeTab === item.id ? "text-blue-400" : ""} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Sidebar Footer: System Identity */}
      <div className="p-6 border-t border-white/5 bg-black/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-surgical-cobalt/20 border border-surgical-cobalt/30 flex items-center justify-center text-blue-400">
            <Settings size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Operator Role</span>
            <span className="text-[11px] font-black text-white uppercase tracking-tighter italic">Mission Lead</span>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </aside>
  );
};

export default MissionSidebar;
