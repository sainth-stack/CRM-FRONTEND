import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  FileBarChart,
  LayoutDashboard,
  Monitor,
  PhoneCall,
  Search,
} from "lucide-react";

const WorkspaceHeader = ({ campaignName, activeTab, onTabChange, hasDrafts, displayStatus }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-200 z-50 px-10 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/active" className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
          <ArrowLeft size={20} strokeWidth={3} />
        </Link>
        <div className="h-8 w-[1px] bg-slate-200" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Mission</span>
          <h1 className="text-lg font-black text-slate-900 tracking-tight italic uppercase truncate max-w-[200px]">
            {campaignName}
          </h1>
        </div>
      </div>

      <nav className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
        <button
          onClick={() => onTabChange("research")}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all ${
            activeTab === "research" ? "bg-white text-brand-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Search size={16} strokeWidth={3} />
          Research
        </button>

        <button
          onClick={() => onTabChange("dashboard")}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all ${
            activeTab === "dashboard" ? "bg-white text-brand-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <LayoutDashboard size={16} strokeWidth={3} />
          Dashboard
        </button>

        <AnimatePresence>
          {hasDrafts && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
              <button
                onClick={() => onTabChange("monitor")}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all ${
                  activeTab === "monitor" ? "bg-white text-brand-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Monitor size={16} strokeWidth={3} />
                Monitor
              </button>
              <button
                onClick={() => onTabChange("discovery")}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all ${
                  activeTab === "discovery" ? "bg-white text-brand-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <PhoneCall size={16} strokeWidth={3} />
                Discovery Call
              </button>
              <button
                onClick={() => onTabChange("report")}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all ${
                  activeTab === "report" ? "bg-white text-brand-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <FileBarChart size={16} strokeWidth={3} />
                Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end mr-4">
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Operation Lifecycle</span>
          <span className="text-[11px] font-black text-slate-900 border-b-2 border-brand-primary tracking-tighter uppercase">
            {displayStatus}
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Bot size={20} />
        </div>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
