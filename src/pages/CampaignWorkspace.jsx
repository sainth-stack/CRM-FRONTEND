import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Search, Users, Mail, 
  CheckCircle2, Loader2, AlertCircle,
  ArrowLeft, ExternalLink, Globe,
  Linkedin, MessageSquare, ChevronRight,
  Monitor, PhoneCall, FileBarChart,
  X, Edit3, Send, Trash, Maximize2, Clock, Calendar, Link2,
  TrendingUp, PieChart, Target, ShieldCheck, LayoutDashboard
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";
import LeadLedger from "./LeadLedger";
import ResearchTabs from "./ResearchTabs";

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

const ensureAbsoluteUrl = (url, fallbackName = "") => {
  if (!url || url === "#" || url === "N/A" || url === "unknown") {
    if (fallbackName) {
      return `https://www.linkedin.com/company/${fallbackName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }
    return "#";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const cleanEmailReply = (body) => {
  if (!body) return "";
  const patterns = [
    /\n\s*On\s+.*\s+wrote:/i,
    /\n\s*-+\s*Original Message\s*-+/i,
    /\n\s*From:/i,
    /\n\s*> / 
  ];
  
  let cleaned = body;
  for (const pattern of patterns) {
    const splitIndex = cleaned.search(pattern);
    if (splitIndex !== -1) {
      cleaned = cleaned.substring(0, splitIndex).trim();
    }
  }
  return cleaned;
};

const DiscoveryTimer = ({ scheduledTime }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(scheduledTime) - new Date();
      if (diff <= 0) return "Starting Now";
      
      const parts = [];
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${mins}m`);
      
      setTimeLeft(parts.join(" "));
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [scheduledTime]);

  return (
    <div className="flex items-center gap-2 text-brand-primary font-black animate-pulse">
      <Clock size={14} />
      {timeLeft}
    </div>
  );
};

const CampaignWorkspace = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("research");
  const [researchTab, setResearchTab] = useState("mission_briefing");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [draftEditData, setDraftEditData] = useState({ subject: "", body: "", email: "" });
  const [sendingId, setSendingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedReportCompany, setExpandedReportCompany] = useState(null);
  const [showHistoryDM, setShowHistoryDM] = useState(null);
  const [highlightedDraftId, setHighlightedDraftId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);

  const toggleNodeExpansion = (nodeId) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  const scrollToDraft = (dmId) => {
    if (!dmId || !campaign?.drafts) return;
    
    // Pick the most recent draft (thanks to backend sorting)
    const targetDraft = campaign.drafts.find(d => 
      String(d.decision_maker_id) === String(dmId) && 
      String(d.status).toUpperCase().includes("DRAFTED")
    );
    
    if (targetDraft) {
      const draftId = String(targetDraft.id);
      setHighlightedDraftId(draftId);
      
      // Delay scroll slightly to allow React state to propagate to DOM
      setTimeout(() => {
        const element = document.getElementById(`draft-card-${draftId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Auto-clear highlight after 5 seconds for better visibility
      setTimeout(() => {
        setHighlightedDraftId(null);
      }, 5000);
    }
  };
  const handleBatchDispatch = async () => {
    // Strategic Batch Deployment Protocol
    alert("Initiating Synchronized Batch Dispatch for all validated modules.");
  };

  const fetchCampaignDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/campaigns/${id}`);
      setCampaign(response.data);
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaignDetails();
    const interval = setInterval(fetchCampaignDetails, 15000);
    return () => clearInterval(interval);
  }, [fetchCampaignDetails]);

  const handleSendMessage = async (draftId, name) => {
    setSendingId(draftId);
    try {
        await axios.post(`${API_BASE_URL}/drafts/${draftId}/send`);
        alert(`Mission Accomplished: Engagement protocol targeting ${name} has been deployed successfully.`);
        await fetchCampaignDetails();
    } catch (error) {
        console.error("Tactical Deployment Failure:", error);
        const errorDetail = error.response?.data?.detail || "Strategic deployment failed. Please check your communication protocols.";
        alert(`ERROR: ${errorDetail}`);
    } finally {
        setSendingId(null);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedDraft) return;
    setIsSaving(true);
    try {
      await axios.patch(`${API_BASE_URL}/drafts/${selectedDraft.id}`, draftEditData);
      await fetchCampaignDetails();
      setSelectedDraft(null);
      alert("Executive Protocol Refinement Synchronized.");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to synchronize refinement.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" strokeWidth={3} />
        <p className="text-zinc-400 font-black uppercase text-xs tracking-widest">Reconstructing Workspace...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white p-10 text-center">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h1 className="text-3xl font-black text-[#1e293b]">Mission Not Found</h1>
        <Link to="/active" className="text-brand-primary font-black uppercase text-xs tracking-widest flex items-center gap-2">
          <ArrowLeft size={16} /> Return to Mission Control
        </Link>
      </div>
    );
  }

  const getDisplayStatus = () => {
    if (!campaign) return "NEW";
    
    // 1. If all companies are finalized
    const companies = campaign.target_companies || [];
    const allFinalized = companies.length > 0 && companies.every(c => 
      c.status === "MEETING_BOOKED" || c.status === "TERMINATED"
    );
    if (allFinalized) return "COMPLETED";

    // Strategic Backend Status Mapping
    switch (String(campaign.status).toUpperCase()) {
      case "RESEARCHING_USER_COMPANY": return "RESEARCHING";
      case "FINDING_TARGET_COMPANIES": return "IDENTIFYING TARGETS";
      case "FINDING_DECISION_MAKERS": return "MAPPING STAKEHOLDERS";
      case "DRAFTING_EMAILS": return "DRAFTING OUTREACH";
      case "COMPLETED": return "MONITORING";
      default: return campaign.status || "NEW";
    }
  };

  const hasDrafts = campaign.drafts_count > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* 1. Tactical Ribbon Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-200 z-50 px-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/active" className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
            <ArrowLeft size={20} strokeWidth={3} />
          </Link>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              {campaign.name ? campaign.name[0].toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Active Mission</span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight uppercase truncate max-w-[200px]">
                {campaign.name}
              </h1>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab("research")}
            className={`relative flex items-center gap-2 px-1 py-4 text-sm font-semibold tracking-wider transition-all ${activeTab === "research" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
          >
            Research
            {activeTab === "research" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
          </button>

          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`relative flex items-center gap-2 px-1 py-4 text-sm font-semibold tracking-wider transition-all ${activeTab === "dashboard" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
          >
            Dashboard
            {activeTab === "dashboard" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
          </button>

          <button 
            onClick={() => setActiveTab("monitor")}
            className={`relative flex items-center gap-2 px-1 py-4 text-sm font-semibold tracking-wider transition-all ${activeTab === "monitor" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
          >
            Monitor
            {activeTab === "monitor" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
          </button>

          <button 
            onClick={() => setActiveTab("discovery")}
            className={`relative flex items-center gap-2 px-1 py-4 text-sm font-semibold tracking-wider transition-all ${activeTab === "discovery" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
          >
            Discovery Call
            {activeTab === "discovery" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
          </button>

          <button 
            onClick={() => setActiveTab("report")}
            className={`relative flex items-center gap-2 px-1 py-4 text-sm font-semibold tracking-wider transition-all ${activeTab === "report" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
          >
            Report
            {activeTab === "report" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
          </button>
        </nav>

        <div className="flex items-center gap-6">
           {campaign.status === "FINDING_DECISION_MAKERS" && (
             <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full animate-pulse">
               <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                 Agent Active: Stakeholder Mapping...
               </span>
             </div>
           )}
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest leading-none">Operation Lifecycle</span>
             <span className="text-[11px] font-black text-slate-900 border-b-2 border-brand-primary tracking-tighter uppercase">{getDisplayStatus()}</span>
           </div>
           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
             <Bot size={20} />
           </div>
        </div>
      </header>

      <main className={
        activeTab === "dashboard" || activeTab === "research"
          ? "pt-20 h-screen overflow-hidden bg-[#f8fafc]"
          : "pt-24 pb-20 px-10 max-w-[1600px] mx-auto"
      }>
        {activeTab === "dashboard" && (
          <LeadLedger campaign={campaign} />
        )}

        {activeTab === "research" && (
          <ResearchTabs 
            campaign={campaign}
            researchTab={researchTab}
            setResearchTab={setResearchTab}
            setSelectedCompany={setSelectedCompany}
            setSelectedDraft={setSelectedDraft}
            setDraftEditData={setDraftEditData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "monitor" && (
           <div className="max-w-[1440px] mx-auto space-y-12">
              {/* Part 1: Page Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 select-none">
                 <div>
                    <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm self-start mb-2 inline-block">Refinement Suite</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase italic">Outreach Review & Launch</h2>
                    <p className="text-slate-400 font-semibold text-sm">Review highly personalized messaging drafts and initiate outreach.</p>
                 </div>
                 <button 
                   onClick={handleBatchDispatch}
                   className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-[18px] font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-lg shadow-red-500/10 shrink-0"
                 >
                    <Send size={16} strokeWidth={3} />
                    Synchronized Batch Dispatch
                 </button>
              </div>

              {/* Part 2: Engagement Tracker Table */}
              <div className="bg-white rounded-[32px] border border-slate-100/80 overflow-hidden shadow-sm mb-12 select-none">
                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100/60 shadow-sm">
                      <FileBarChart size={18} strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 uppercase italic tracking-tight leading-none">Active Engagement Tracker</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Outreach Lifecycle Monitoring</p>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/30">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prospect</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Status</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Mission Pulse</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {(campaign.dms || []).filter(dm => !["NEW", "SYNCED"].includes(dm.status)).length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-8 py-16 text-center">
                            <div className="flex flex-col items-center gap-3 text-slate-300">
                              <Loader2 className="animate-spin text-red-500" size={32} />
                              <p className="text-xs font-bold uppercase tracking-widest">Awaiting first deployment...</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        (campaign.dms || []).filter(dm => !["NEW", "SYNCED"].includes(dm.status)).map((dm) => {
                          const company = campaign.target_companies.find(c => String(c.id) === String(dm.target_company_id));
                          
                          let displayStatus = "Waiting for Reply";
                          let statusColor = "bg-blue-50 text-blue-500 border-blue-100";
                          let dotColor = "bg-blue-500";
                          
                          if (dm.status === "TERMINATED") {
                            displayStatus = "Terminated";
                            statusColor = "bg-slate-50 text-slate-400 border-slate-200";
                            dotColor = "bg-slate-300";
                          } else if (dm.status === "MEETING_BOOKED" || dm.status === "DATE_AND_MEETING_SECURED") {
                            displayStatus = "Meeting Booked";
                            statusColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                            dotColor = "bg-emerald-500";
                          } else if (dm.status.includes("DRAFTED")) {
                            displayStatus = "Action Required (Approval)";
                            statusColor = "bg-amber-50 text-amber-600 border-amber-100";
                            dotColor = "bg-amber-500 animate-pulse";
                          } else if (dm.status === "DISCOVERY_CALL" || dm.status === "WAITING_FOR_REPLY") {
                            displayStatus = "Discovery Protocol";
                            statusColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                            dotColor = "bg-emerald-500";
                          }
                          
                          const initials = (dm.name || "P")
                            .split(" ")
                            .filter(Boolean)
                            .map(w => w[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);

                          return (
                            <tr key={dm.id} className="hover:bg-slate-50/40 transition-colors group">
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3.5">
                                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-sm select-none">
                                    {initials}
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-extrabold text-slate-800 tracking-tight leading-none uppercase">{dm.name}</p>
                                      {dm.reply_intent && (
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border ${
                                          dm.reply_intent === 'POSITIVE' ? 'bg-emerald-500 text-white border-emerald-600' :
                                          dm.reply_intent === 'NEGATIVE' ? 'bg-rose-500 text-white border-rose-600' :
                                          'bg-amber-400 text-white border-amber-500'
                                        }`}>
                                          {dm.reply_intent}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{dm.position || "Stakeholder"}</p>
                                  </div>
                                  <button 
                                    onClick={() => setShowHistoryDM(dm)}
                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition-all shadow-sm"
                                    title="View Communication History"
                                  >
                                    <MessageSquare size={14} strokeWidth={2.5} />
                                  </button>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">{company?.name || "Target Organization"}</p>
                                  <div className="flex items-center gap-1.5 text-slate-300">
                                     <Globe size={11} />
                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{company?.website?.replace(/(https?:\/\/|www\.|\/)/g, "") || "Connect"}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <div 
                                  onClick={() => dm.status.includes("DRAFTED") && scrollToDraft(dm.id)}
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${statusColor} text-[10px] font-black uppercase tracking-widest ${dm.status.includes("DRAFTED") ? "cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm" : ""}`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                  {displayStatus}
                                  {dm.status.includes("DRAFTED") && <ChevronRight size={10} strokeWidth={4} />}
                                </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <p className="text-[11px] font-black text-slate-800 uppercase italic tracking-tight">
                                  {(() => {
                                    if (dm.status === "TERMINATED") return "Mission Complete";
                                    if (dm.status === "MEETING_BOOKED" || dm.status === "DATE_AND_MEETING_SECURED") return "Discovery Call Scheduled";
                                    if (dm.status.includes("DRAFTED")) {
                                       return `SIGNAL CAPTURED: ${dm.reply_intent || "ANALYZING"}`;
                                    }
                                    if (dm.status === "INITIAL_SENT") return "Waiting for Initial Protocol";
                                    if (dm.status.includes("FOLLOWUP") && dm.status.includes("SENT")) return `Waiting for Follow-up #${dm.followup_count || 1}`;
                                    if (dm.status === "WAITING_FOR_REPLY" || dm.status === "DISCOVERY_CALL") return "Waiting for Discovery Reply";
                                    return "Active Engagement";
                                  })()}
                                </p>
                                <div className="flex flex-col items-end gap-1 mt-1">
                                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic leading-none">
                                    {dm.status.includes("DRAFTED") ? "Awaiting Executive Authorization" : "Awaiting Interaction Signal"}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Part 3: Pending Approvals */}
              <div className="flex items-center gap-4 mb-6 select-none">
                 <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100/60 shadow-sm">
                   <Mail size={18} strokeWidth={3} />
                 </div>
                 <div>
                    <h3 className="text-base font-extrabold text-slate-900 uppercase italic tracking-tight leading-none">Pending Approvals</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorize messaging for deployment</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
                 {(campaign.drafts || []).filter(d => {
                    const dm = campaign.dms.find(dm => dm.id === d.decision_maker_id);
                    return String(d.status).includes("DRAFTED") && dm?.status !== "TERMINATED";
                 }).length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center gap-4 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-100/80">
                      <CheckCircle2 size={40} className="text-emerald-500" />
                      <div className="text-center">
                        <h4 className="text-base font-extrabold text-slate-800 uppercase italic tracking-tight mb-0.5">All Modules Initialized</h4>
                        <p className="text-slate-400 font-semibold text-xs">No outreach items awaiting authorization.</p>
                      </div>
                    </div>
                 ) : (
                    (campaign.drafts || []).filter(d => {
                       const dm = campaign.dms.find(dm => dm.id === d.decision_maker_id);
                       return String(d.status).includes("DRAFTED") && dm?.status !== "TERMINATED" && dm?.status !== "DISCOVERY_CALL";
                    }).map((draft) => {
                    const dm = campaign.dms.find(d => d.id === draft.decision_maker_id);
                    const co = campaign.target_companies.find(c => c.id === dm?.target_company_id);
                    const prospectEmail = dm?.email || `${dm?.name.toLowerCase().replace(/ /g, ".")}@${co?.website?.replace(/(https?:\/\/|www\.|\/)/g, "")}`;
                    
                    const initials = (dm?.name || "P")
                      .split(" ")
                      .filter(Boolean)
                      .map(w => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <motion.div 
                        key={draft.id}
                        id={`draft-card-${draft.id}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        onClick={() => {
                           const email = dm?.email || `${dm?.name.toLowerCase().replace(/ /g, ".")}@${co?.website?.replace(/(https?:\/\/|www\.|\/)/g, "")}`;
                           setDraftEditData({ subject: draft.subject, body: draft.body, email: email });
                           setSelectedDraft(draft);
                        }}
                        className={`bg-white rounded-[32px] p-8 shadow-sm transition-all relative overflow-hidden group cursor-pointer flex flex-col h-[400px] border border-slate-100/80 hover:border-red-100/60 ${String(highlightedDraftId) === String(draft.id) ? 'ring-4 ring-red-500 ring-offset-4 border-2 border-red-500 scale-[1.02] z-[100] shadow-2xl shadow-red-500/20' : ''}`}
                      >
                         <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Mail size={100} strokeWidth={1} />
                         </div>

                         <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-6">
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none mb-1 select-none">Review Phase</p>
                                  <h4 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase select-none">{dm?.name}</h4>
                                  <div className="flex flex-col gap-0.5">
                                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{co?.name}</p>
                                     <p className="text-[10px] font-bold text-slate-300 italic lowercase select-all">{prospectEmail}</p>
                                  </div>
                               </div>
                               <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
                                  {initials}
                                </div>
                            </div>

                            <div className="space-y-3 flex-grow overflow-hidden mb-6 select-none">
                               <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-100/80">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase underline decoration-red-500/20 mb-1 tracking-widest">Subject Line</p>
                                  <p className="text-xs font-bold text-slate-800 tracking-tight leading-snug line-clamp-1">{draft.subject}</p>
                                </div>
                               <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100/80 flex-grow">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase underline decoration-red-500/20 mb-2 tracking-widest">Content snippet</p>
                                  <p className="text-xs font-medium text-slate-600 italic leading-relaxed line-clamp-3">
                                     "{draft.body}"
                                  </p>
                               </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50 mt-auto select-none">
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleSendMessage(draft.id, dm?.name);
                                 }}
                                 disabled={sendingId === draft.id || draft.status === "DEPLOYED"}
                                 className={`py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${draft.status === "DEPLOYED" ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/10 hover:scale-[1.01] active:scale-[0.99]"}`}
                               >
                                  {sendingId === draft.id ? <Loader2 size={14} className="animate-spin" /> : (draft.status === "DEPLOYED" ? <CheckCircle2 size={14} strokeWidth={3} /> : <Send size={14} strokeWidth={3} />)}
                                   {sendingId === draft.id ? "Deploying" : "Authorize"}
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-400 hover:text-red-600 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                   <Trash size={14} strokeWidth={2.5} />
                                   Terminate
                                </button>
                             </div>
                          </div>
                      </motion.div>
                    );
                  })
                 )}
              </div>
           </div>
        )}

        {activeTab === "discovery" && (
           <div className="max-w-[1440px] mx-auto space-y-16">
                             {/* Part 1: Engagement Outreach Drafts (Discovery) */}
              <section>
                                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 select-none">
                  <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 shadow-sm">
                       <Edit3 size={20} strokeWidth={3} />
                     </div>
                     <div>
                        <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm self-start mb-2 inline-block">Refinement Suite</span>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase italic">Engagement Outreach Drafts</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Discovery Phase Invitation Controls</p>
                     </div>
                   </div>
                   <div className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-extrabold text-slate-500 uppercase tracking-widest shadow-sm">
                     {(campaign.dms || []).filter(dm => dm.status === "DISCOVERY_CALL" || dm.status === "WAITING_FOR_REPLY").length} Active Protocols
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(campaign.dms || []).filter(dm => dm.status === "DISCOVERY_CALL" || dm.status === "WAITING_FOR_REPLY").map(dm => {
                    const dmDrafts = (campaign.drafts || []).filter(d => d.decision_maker_id === dm.id);
                    const draft = dmDrafts[0];
                    const co = campaign.target_companies.find(c => c.id === dm.target_company_id);
                    
                    if (!draft) return null;

                    return (
                      <motion.div 
                         key={dm.id}
                         initial={{ opacity: 0, scale: 0.98 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100/80 transition-all hover:border-red-100/60 flex flex-col h-[400px] select-none"
                       >
                          <div className="flex flex-col h-full">
                             <div className="flex items-start justify-between mb-6">
                               <div className="space-y-1 flex-grow">
                                 <div className="flex items-center gap-2">
                                   <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${dm.status === "WAITING_FOR_REPLY" ? "bg-orange-50 text-orange-500 border border-orange-100" : "bg-red-50 text-red-500 border border-red-100"}`}>
                                     {dm.status === "WAITING_FOR_REPLY" ? "Awaiting Reply" : "Ready to Draft"}
                                   </span>
                                   {dm.reply_intent && (
                                     <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                                       dm.reply_intent === 'POSITIVE' ? 'bg-emerald-500 text-white border-emerald-600' :
                                       dm.reply_intent === 'NEGATIVE' ? 'bg-rose-500 text-white border-rose-600' :
                                       'bg-amber-400 text-white border-amber-500'
                                     }`}>
                                       {dm.reply_intent}
                                     </span>
                                   )}
                                 </div>
                                 <h4 className="text-lg font-extrabold text-slate-800 tracking-tight leading-tight uppercase pt-2">{dm.name}</h4>
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{co?.name}</p>
                               </div>
                               <button 
                                 onClick={() => {
                                   setDraftEditData({ subject: draft.subject, body: draft.body, email: dm.email });
                                   setSelectedDraft(draft);
                                 }}
                                 className="h-11 w-11 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 border border-slate-200/60 hover:border-red-100 flex items-center justify-center transition-all shadow-sm group-hover:scale-105 shrink-0"
                               >
                                 <Maximize2 size={16} />
                               </button>
                             </div>

                             <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100/80 flex-grow mb-6 select-text">
                                <p className="text-[8px] font-bold text-slate-400 uppercase underline decoration-red-500/20 mb-2 tracking-widest">Discovery Request Bundle</p>
                                <p className="text-xs font-bold text-slate-800 tracking-tight leading-snug line-clamp-1 mb-1.5">{draft.subject}</p>
                                <p className="text-[13px] font-medium text-slate-600 italic leading-relaxed line-clamp-3">
                                   "{draft.body}"
                                 </p>
                             </div>

                             <button 
                                onClick={() => handleSendMessage(draft.id, dm.name)}
                                disabled={sendingId === draft.id || dm.status === "WAITING_FOR_REPLY"}
                                className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${dm.status === "WAITING_FOR_REPLY" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white shadow-lg shadow-red-500/10 hover:scale-[1.01] active:scale-[0.99]"}`}
                             >
                                {sendingId === draft.id ? <Loader2 size={16} className="animate-spin" /> : (dm.status === "WAITING_FOR_REPLY" ? <Clock size={16} /> : <Send size={16} />)}
                                {dm.status === "WAITING_FOR_REPLY" ? "In Orbit (Waiting)" : "Deploy Discovery Protocol"}
                             </button>
                          </div>
                       </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* Part 2: Strategic Meeting Intel (Booked) */}
              <section>
                 <div className="flex items-center gap-4 mb-10 select-none">
                    <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center shadow-sm">
                      <Calendar size={20} strokeWidth={3} />
                    </div>
                    <div>
                        <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm self-start mb-2 inline-block">Engagement Suite</span>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase italic">Strategic Meeting Intel</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Confirmed Stakeholder Engagements</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] border border-slate-100/80 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/30">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Repository</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholder</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Target (IST)</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Countdown Protocol</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Coordinate (Link)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {(campaign.dms || []).filter(dm => dm.status === "MEETING_BOOKED" || dm.status === "DATE_AND_MEETING_SECURED").length === 0 ? (
                             <tr>
                               <td colSpan="5" className="px-8 py-16 text-center">
                                  <div className="flex flex-col items-center gap-4 text-slate-300">
                                    <Bot size={40} strokeWidth={1} className="opacity-20 text-red-400" />
                                    <p className="text-xs font-bold uppercase tracking-widest italic animate-pulse">Scanning for confirmed bookings...</p>
                                  </div>
                               </td>
                             </tr>
                           ) : (
                             (campaign.dms || []).filter(dm => dm.status === "MEETING_BOOKED" || dm.status === "DATE_AND_MEETING_SECURED").map((dm) => {
                               const co = campaign.target_companies.find(c => c.id === dm.target_company_id);
                               const initials = (dm.name || "P")
                                 .split(" ")
                                 .filter(Boolean)
                                 .map(w => w[0])
                                 .join("")
                                 .toUpperCase()
                                 .slice(0, 2);

                               return (
                                 <tr key={dm.id} className="hover:bg-slate-50/40 transition-colors group">
                                    <td className="px-8 py-6">
                                       <p className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">{co?.name}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                       <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                            {initials}
                                          </div>
                                          <p className="text-sm font-bold text-slate-700">{dm.name}</p>
                                       </div>
                                    </td>
                                    <td className="px-8 py-6">
                                       <p className="text-[11px] font-extrabold text-slate-800 uppercase tabular-nums">
                                          {new Date(dm.scheduled_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', ' @')}
                                       </p>
                                    </td>
                                    <td className="px-8 py-6">
                                       <DiscoveryTimer scheduledTime={dm.scheduled_time} />
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                       <a 
                                         href={dm.meeting_link} target="_blank" rel="noreferrer"
                                         className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                       >
                                         <Link2 size={13} strokeWidth={3} />
                                         Access Bridge
                                       </a>
                                    </td>
                                 </tr>
                               );
                             })
                           )}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </section>
           </div>
        )}

        {activeTab === "report" && (
           <div className="max-w-[1200px] mx-auto space-y-12 select-none">
              {/* Report Header: Aggregate Intelligence */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Total Profiled", value: campaign.target_companies_count, icon: Search, color: "text-red-600", bg: "bg-red-50 border border-red-100/60" },
                  { label: "Avg Alignment", value: `${Math.round(campaign.target_companies.reduce((acc, c) => acc + (c.similarity_score?.score || 0), 0) / (campaign.target_companies_count || 1))}%`, icon: Target, color: "text-red-600", bg: "bg-red-50 border border-red-100/60" },
                  { label: "Total Prospects", value: (campaign.dms || []).length, icon: Users, color: "text-red-600", bg: "bg-red-50 border border-red-100/60" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm flex items-center gap-5 hover:scale-[1.01] transition-transform">
                    <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
                      <stat.icon size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                      <h4 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">{stat.value}</h4>
                    </div>
                  </div>
                ))}
              </div>

              {/* Company List: Multi-Threaded Intelligence Repository */}
              <section className="bg-white rounded-[32px] border border-slate-100/80 overflow-hidden shadow-sm select-none">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-50 border border-red-100/60 rounded-xl flex items-center justify-center text-red-600 shadow-sm">
                      <PieChart size={18} strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Organizational Intelligence Repository</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Vertical Campaign Audit</p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {campaign.target_companies.map((company) => {
                    const companyDMs = (campaign.dms || []).filter(dm => dm.target_company_id === company.id);
                    const isExpanded = expandedReportCompany === company.id;
                    const companyInitials = (company.name || "C")
                      .split(" ")
                      .filter(Boolean)
                      .map(w => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    
                    return (
                      <div key={company.id} className="flex flex-col border-b border-slate-50 last:border-0">
                        <div 
                          onClick={() => setExpandedReportCompany(isExpanded ? null : company.id)}
                          className="px-8 py-5 hover:bg-slate-50/40 transition-all cursor-pointer group flex items-center justify-between select-none"
                        >
                          <div className="flex items-center gap-5 flex-grow">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all font-black text-xs shadow-sm shrink-0 select-none ${isExpanded ? 'bg-red-600 text-white shadow-red-500/10' : 'bg-red-50 text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white'}`}>
                              {companyInitials}
                            </div>
                            <div>
                              <h4 className={`text-base font-extrabold uppercase tracking-tight transition-colors ${isExpanded ? 'text-red-600' : 'text-slate-800 group-hover:text-red-600'}`}>
                                {company.name}
                              </h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Target Organization</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-10">
                            <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Alignment</p>
                              <span className="text-sm font-extrabold text-red-600">{company.similarity_score?.score || 0}%</span>
                            </div>
                            
                            <div className="text-right w-24">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Prospects</p>
                              <div className="flex items-center justify-end gap-1.5 text-slate-600">
                                 <Users size={13} strokeWidth={3} />
                                 <span className="text-sm font-extrabold">{companyDMs.length}</span>
                              </div>
                            </div>

                            <div className={`text-slate-300 transition-all duration-300 ${isExpanded ? 'rotate-90 text-red-600' : 'group-hover:text-red-600'}`}>
                               <ChevronRight size={18} strokeWidth={3} />
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden bg-slate-50/40 select-none"
                            >
                              <div className="px-8 pb-8 pt-2 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                                  {[
                                    { label: "Phone Protocol", value: company.contact_number, icon: PhoneCall },
                                    { label: "HQ Coordinates", value: company.location, icon: Globe },
                                    { label: "Corporate Email", value: company.contact_email, icon: Mail }
                                  ].map((item, idx) => (
                                    <div key={idx} className="bg-white p-4.5 rounded-2xl border border-slate-100/80 shadow-sm hover:border-red-100/50 transition-all select-text">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <item.icon size={13} className="text-red-500" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.label}</span>
                                      </div>
                                      <p className="text-xs font-extrabold text-slate-800 truncate uppercase tabular-nums">{item.value || "N/A"}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-3 mb-5 select-none">
                                  <div className="h-[1px] flex-grow bg-slate-100" />
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap leading-none select-none">Mapped Stakeholders</span>
                                  <div className="h-[1px] flex-grow bg-slate-100" />
                                </div>
                                {companyDMs.length === 0 ? (
                                  <div className="p-6 bg-white border border-slate-100/80 rounded-2xl flex flex-col items-center justify-center gap-3 text-center select-none shadow-sm">
                                    <Bot size={28} className="text-red-400 opacity-40 animate-pulse" />
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide leading-none">No Mapped Stakeholders for this Profile</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {companyDMs.map((dm) => {
                                      const dmInitials = (dm.name || "P")
                                        .split(" ")
                                        .filter(Boolean)
                                        .map(w => w[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2);

                                      return (
                                        <div 
                                          key={dm.id}
                                          className="bg-white p-4.5 rounded-2xl border border-slate-100/80 shadow-sm flex items-center justify-between group/dm hover:border-red-100/50 transition-all select-none"
                                        >
                                           <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-extrabold text-xs group-hover/dm:scale-105 transition-all shadow-sm">
                                              {dmInitials}
                                            </div>
                                            <div>
                                              <button 
                                                onClick={() => setShowHistoryDM(dm)}
                                                className="text-sm font-extrabold text-slate-800 tracking-tight hover:text-red-600 transition-colors cursor-pointer text-left uppercase leading-tight select-text"
                                              >
                                                {dm.name}
                                              </button>
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none pt-0.5">{dm.position}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <a 
                                              href={ensureAbsoluteUrl(dm.linkedin)} 
                                              target="_blank" rel="noreferrer"
                                              className="p-2 text-slate-400 hover:text-[#0a66c2] transition-all hover:scale-110 active:scale-95 shrink-0"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <Linkedin size={16} />
                                            </a>
                                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                              (dm.status === "MEETING_BOOKED" || dm.status === "DATE_AND_MEETING_SECURED") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                                              dm.status.includes("SENT") ? "bg-blue-50 text-blue-600 border border-blue-100" : 
                                              "bg-slate-50 text-slate-500 border border-slate-100"
                                            }`}>
                                              {dm.status.replace(/_/g, " ")}
                                            </div>
                                            {dm.reply_intent && (
                                              <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm border ${
                                                dm.reply_intent === 'POSITIVE' ? 'bg-emerald-500 text-white border-emerald-600' :
                                                dm.reply_intent === 'NEGATIVE' ? 'bg-rose-500 text-white border-rose-600' :
                                                'bg-amber-400 text-white border-amber-500'
                                              }`}>
                                                {dm.reply_intent}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
           </div>
        )}
      </main>

      {/* Target Intel Professional Overlay */}
      <AnimatePresence>
        {selectedCompany && (() => {
          const score = selectedCompany.relevance_score || selectedCompany.similarity_score?.score || 0;
          const reason = selectedCompany.relevance_explanation || selectedCompany.similarity_score?.reason || "High match synergy detected";
          
          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCompany(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-y-auto max-h-[85vh] z-10 border border-slate-100 flex flex-col"
              >
                 {/* Close Button */}
                 <button 
                   onClick={() => setSelectedCompany(null)}
                   className="absolute top-6 right-6 w-10 h-10 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all z-20 shadow-sm"
                 >
                   <X size={20} />
                 </button>

                 <div className="grid grid-cols-1 md:grid-cols-12 h-full flex-1">
                    {/* Left Column: Organization Identity */}
                    <div className="md:col-span-5 p-8 md:p-10 bg-slate-50/50 border-r border-slate-100 space-y-8 flex flex-col justify-between">
                       <div className="space-y-6">
                          {/* Logo/Icon Header */}
                          <div className="flex items-center gap-4">
                             <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/10 flex items-center justify-center font-black text-xl tracking-tight select-none">
                                {(selectedCompany.name || "C")
                                  .split(" ")
                                  .filter(Boolean)
                                  .map(w => w[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                             </div>
                             <div className="flex flex-col">
                                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider self-start mb-1 shadow-sm">Approved</span>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{selectedCompany.name}</h2>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <a href={ensureAbsoluteUrl(selectedCompany.website)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm transition-all underline decoration-red-100 underline-offset-4 decoration-2">
                                {selectedCompany.website} <ExternalLink size={14} />
                             </a>
                             <p className="text-slate-500 text-xs font-semibold leading-relaxed">Verified corporate footprint & identity data.</p>
                          </div>
                          
                          {/* Synergy Meter */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                             <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alignment Score</span>
                                <span className="text-lg font-black text-slate-900 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg border border-red-100 shadow-sm">{score}%</span>
                             </div>
                             <p className="text-slate-600 font-medium text-xs leading-relaxed italic bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/60">
                                "{reason}"
                             </p>
                          </div>

                          {/* Detail Grid */}
                          <div className="space-y-3 pt-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Attributes</p>
                             <div className="grid grid-cols-1 gap-2.5">
                                <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-3.5 group hover:border-red-100/60 transition-all shadow-sm">
                                   <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 transition-colors">
                                      <Monitor size={16} />
                                   </div>
                                   <div>
                                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Headquarters</p>
                                      <p className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">{selectedCompany.location || "Global Operations"}</p>
                                   </div>
                                </div>
                                <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-3.5 group hover:border-red-100/60 transition-all shadow-sm">
                                   <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 transition-colors">
                                      <Mail size={16} />
                                   </div>
                                   <div>
                                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Inbound Email</p>
                                      <p className="text-xs font-bold text-slate-800 lowercase tracking-tight truncate">{selectedCompany.contact_email || "N/A"}</p>
                                   </div>
                                </div>
                                <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-3.5 group hover:border-red-100/60 transition-all shadow-sm">
                                   <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 transition-colors">
                                      <PhoneCall size={16} />
                                   </div>
                                   <div>
                                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Contact Line</p>
                                      <p className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">{selectedCompany.contact_number || "N/A"}</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Right Column: Deep Intel Narrative */}
                    <div className="md:col-span-7 p-8 md:p-10 space-y-8 flex flex-col justify-between bg-white h-full">
                       <div className="space-y-6 flex-1 overflow-y-auto max-h-[480px] pr-2 select-text custom-scrollbar">
                          <div>
                             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 underline decoration-red-500/20 underline-offset-4 decoration-2">Deep Research Insight</h3>
                             <p className="text-slate-600 font-medium text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-6 rounded-[20px] border border-slate-100">
                                {selectedCompany.deep_research || "Intelligent reconnaissance summary and company core research insights are currently processing."}
                             </p>
                          </div>
                       </div>

                       {/* Interactive Navigation Footer */}
                       <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                          <a 
                            href={ensureAbsoluteUrl(selectedCompany.linkedin, selectedCompany.name)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-3 py-4 bg-[#0077b5] hover:bg-[#006bb0] text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-blue-500/10"
                          >
                             <Linkedin size={20} /> LinkedIn Profile
                          </a>
                          <a 
                            href={ensureAbsoluteUrl(selectedCompany.website)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all"
                          >
                             <Globe size={20} /> View Website
                          </a>
                       </div>
                    </div>
                 </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Engagement Protocol Modal */}
      <AnimatePresence>
        {selectedDraft && (() => {
          const dm = campaign.dms.find(d => d.id === selectedDraft.decision_maker_id);
          const co = campaign.target_companies.find(c => c.id === dm?.target_company_id);

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDraft(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-y-auto max-h-[85vh] z-10 border border-slate-100 flex flex-col"
              >
                 {/* Close Button */}
                 <button 
                   onClick={() => setSelectedDraft(null)}
                   className="absolute top-6 right-6 w-10 h-10 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all z-20 shadow-sm"
                 >
                   <X size={20} />
                 </button>

                 <div className="grid grid-cols-1 md:grid-cols-12 h-full flex-1">
                    {/* Left Column: Context & Metadata */}
                    <div className="md:col-span-5 p-8 md:p-10 bg-slate-50/50 border-r border-slate-100 space-y-8 flex flex-col justify-between">
                       <div className="space-y-6">
                          {/* Logo/Icon Header */}
                          <div className="flex items-center gap-4">
                             <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/10 flex items-center justify-center font-black text-xl tracking-tight select-none">
                                {(dm?.name || "P")
                                  .split(" ")
                                  .filter(Boolean)
                                  .map(w => w[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                             </div>
                             <div className="flex flex-col">
                                <span className="px-2.5 py-0.5 bg-red-50 border border-red-100 text-red-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider self-start mb-1 shadow-sm">Draft Refinement</span>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{dm?.name}</h2>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Organization</span>
                                <p className="text-sm font-extrabold text-slate-800">{co?.name || "Unknown Organization"}</p>
                             </div>
                          </div>

                          {/* Editable Email */}
                          <div className="space-y-3 pt-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deployment Coordinate</p>
                             <div className="bg-white p-5 rounded-2xl border border-slate-100 focus-within:border-red-500/30 transition-all shadow-sm space-y-1.5">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Recipient Email</span>
                                <input 
                                  value={draftEditData.email}
                                  onChange={(e) => setDraftEditData({ ...draftEditData, email: e.target.value })}
                                  className="w-full bg-transparent font-bold text-slate-800 outline-none text-sm tracking-tight"
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Right Column: Editable Message Content */}
                    <div className="md:col-span-7 p-8 md:p-10 space-y-6 flex flex-col justify-between bg-white h-full">
                       <div className="space-y-6 flex-1 pr-2 select-text">
                          <div className="bg-slate-50/60 p-5 rounded-xl border border-slate-100 focus-within:border-red-500/30 transition-all">
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 block select-none">Strategic Subject Header</span>
                             <input 
                               value={draftEditData.subject}
                               onChange={(e) => setDraftEditData({ ...draftEditData, subject: e.target.value })}
                               className="w-full bg-transparent font-black text-slate-900 outline-none text-base tracking-tight leading-relaxed"
                             />
                          </div>

                          <div className="bg-slate-50/60 p-6 rounded-[20px] border border-slate-100 focus-within:border-red-500/30 transition-all flex-grow">
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 block select-none">Narrative Protocol Body</span>
                             <textarea 
                               value={draftEditData.body}
                               onChange={(e) => setDraftEditData({ ...draftEditData, body: e.target.value })}
                               className="w-full bg-transparent font-medium text-slate-600 outline-none text-sm leading-relaxed min-h-[220px] resize-none"
                             />
                          </div>
                       </div>

                       {/* Action Controls Footer */}
                       <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setSelectedDraft(null)}
                            className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all"
                          >
                             Discard Changes
                          </button>
                          <button 
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-500/10"
                          >
                             {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />}
                             Save & Refine
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Interaction History Drawer */}
      <AnimatePresence>
        {showHistoryDM && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryDM(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-100"
            >
              <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/40 select-none">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <MessageSquare size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-extrabold text-slate-900 uppercase italic tracking-tight leading-tight">Mission Engagement Chain</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-1">
                      {showHistoryDM.name} • {campaign.target_companies.find(c => c.id === showHistoryDM.target_company_id)?.name}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHistoryDM(null)} 
                  className="w-10 h-10 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center border border-slate-100/60 shadow-sm"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/20 relative">
                <div className="absolute left-[43px] md:left-[51px] top-8 bottom-8 w-0.5 bg-slate-100/80" />

                <div className="relative flex gap-5 md:gap-6">
                   <div className="z-10 bg-white w-9 h-9 rounded-xl border-2 border-slate-100 flex items-center justify-center text-red-500 shadow-sm shrink-0">
                      <Target size={16} strokeWidth={3} />
                   </div>
                   <div 
                      onClick={() => toggleNodeExpansion('strategy')}
                      className="bg-white p-5 rounded-2xl border border-slate-100/80 shadow-sm flex-grow cursor-pointer hover:border-red-100/40 hover:bg-slate-50/30 transition-all"
                   >
                      <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest mb-1 select-none">Stage 0: Targeting Strategy</p>
                      <p className="text-xs font-extrabold text-slate-800 uppercase italic tracking-tight mb-2 select-none">Strategic Alignment Identification</p>
                      <p className={`text-sm font-semibold text-slate-600 italic leading-relaxed select-text ${expandedNodes.includes('strategy') ? '' : 'line-clamp-3'}`}>
                         "{showHistoryDM.similarity_score?.reason || "Lead identified through high-intent LinkedIn reconnaissance."}"
                      </p>
                   </div>
                </div>

                {(!showHistoryDM.logs || showHistoryDM.logs.length === 0) ? (
                  <div className="relative flex gap-5 md:gap-6 opacity-40">
                    <div className="z-10 bg-slate-50 w-9 h-9 rounded-xl border-2 border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                       <Clock size={16} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col justify-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Awaiting Live Engagement Response...</p>
                    </div>
                  </div>
                ) : (
                  [...showHistoryDM.logs].reverse().map((log, i) => {
                    const isFirstLog = i === 0;
                    return (
                      <div key={i} className="relative flex gap-5 md:gap-6">
                         <div className={`z-10 w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm shrink-0 ${log.direction === 'SENT' ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-emerald-600 border-emerald-700 text-white'}`}>
                            {log.direction === 'SENT' ? (isFirstLog ? <Bot size={16} strokeWidth={2.5} /> : <Mail size={16} strokeWidth={2.5} />) : <MessageSquare size={16} strokeWidth={2.5} />}
                         </div>
                         <div className={`p-5 rounded-2xl border shadow-sm flex-grow select-text ${log.direction === 'SENT' ? 'bg-white border-slate-100 hover:border-indigo-100' : 'bg-white border-slate-100 hover:border-emerald-100'} transition-all`}>
                            <div className="flex items-center justify-between mb-2 select-none">
                               <p className={`text-[9px] font-bold uppercase tracking-widest ${log.direction === 'SENT' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                  {log.direction === 'SENT' ? (isFirstLog ? 'Mission Alpha: Inaugural Signal' : 'Mission Outbound') : 'Signal Captured'} • {formatTimeAgo(log.received_at)}
                                </p>
                               <div className="p-1 px-1.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Sync ID: #{String(log.id).slice(-4)}</div>
                            </div>
                            <p className="text-sm font-extrabold text-slate-800 uppercase italic tracking-tight mb-1">Subject: {log.subject}</p>
                            <p className={`text-sm font-medium leading-relaxed whitespace-pre-wrap ${log.direction === 'SENT' ? 'text-slate-600 italic' : 'text-slate-600 font-medium'}`}>
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
    </div>
  );
};

export default CampaignWorkspace;
