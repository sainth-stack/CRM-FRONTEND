import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, Mail,
  CheckCircle2, Loader2, AlertCircle,
  ArrowLeft, ExternalLink, Globe,
  Linkedin, MessageSquare, ChevronRight,
  Monitor, PhoneCall, FileBarChart,
  X, Edit3, Send, Trash, Maximize2, Clock, Calendar, Link2,
  TrendingUp, PieChart, Target, ShieldCheck, LayoutDashboard,
  Activity, BarChart3, Filter, ChevronDown,
  PenLine, Inbox, HelpCircle, RefreshCw
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";
import LeadLedger from "./LeadLedger";
import ResearchTabs from "./ResearchTabs";
import MissionSidebar from "../components/campaign-workspace/MissionSidebar";
import DraftEditorModal from "../components/campaign-workspace/DraftEditorModal";
import DraftPreviewModal from "../components/campaign-workspace/DraftPreviewModal";

// Helper to force uniform UTC parsing on both timezone-naive and timezone-aware ISO strings
const parseUtcDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  let formatted = String(dateStr);
  // If it's a naive ISO timestamp, append 'Z' so JavaScript interprets it uniformly as UTC
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(formatted) &&
    !formatted.endsWith("Z") &&
    !/[+-]\d{2}:?\d{2}$/.test(formatted)
  ) {
    formatted += "Z";
  }
  
  const parsed = new Date(formatted);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Never";
  const date = parseUtcDate(timestamp);
  if (!date) return "Never";
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

const formatTimeLeft = (targetDateString) => {
  if (!targetDateString) return "TBD";
  const target = new Date(targetDateString);
  const now = new Date();
  const diffMs = target - now;
  
  if (diffMs < 0) return "Elapsed";
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays}d ${diffHours}h left`;
  if (diffHours > 0) return `${diffHours}h ${diffMinutes}m left`;
  return `${diffMinutes}m left`;
};

const formatMeetingDate = (utcDateString, displayTimezone) => {
  if (!utcDateString) return "—";
  // Backend stores scheduled_time_utc as naive UTC (no tz suffix)
  const raw = utcDateString.endsWith("Z") ? utcDateString : utcDateString + "Z";
  const date = new Date(raw);
  if (isNaN(date.getTime())) return "—";
  const tz = displayTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: tz,
    });
  } catch (e) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

const formatMeetingTime = (utcDateString, displayTimezone) => {
  if (!utcDateString) return "—";
  const raw = utcDateString.endsWith("Z") ? utcDateString : utcDateString + "Z";
  const date = new Date(raw);
  if (isNaN(date.getTime())) return "—";
  const tz = displayTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
    timeZoneName: "short",
  });
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

const ProgressTracker = ({ status }) => {
  const stages = [
    { id: "PENDING", label: "Ingestion" },
    { id: "STAGE_1_CSV_TRIMMED", label: "Validation" },
    { id: "STAGE_2_USER_INTEL_COMPLETE", label: "Brand DNA" },
    { id: "STAGE_3_ICP_FILTERED", label: "ICP Filter" },
    { id: "STAGE_4_RESEARCH_COMPLETE", label: "Deep Research" },
    { id: "STAGE_5_STAKEHOLDERS_RANKED", label: "Stakeholders" },
    { id: "STAGE_6_DRAFTING_COMPLETE", label: "Drafting" },
  ];

  let currentIdx = stages.findIndex(s => s.id === status);
  if (status === "COMPLETED") {
    currentIdx = stages.length; // all completed
  }
  
  return (
    <div className="w-full bg-white border-b border-surgical-border px-10 py-8 select-none">
      <div className="max-w-[1200px] mx-auto relative">
        {/* Connection Line */}
        <div className="absolute top-[18px] left-0 right-0 h-[2px] bg-slate-100 z-0" />
        
        <div className="flex items-center justify-between relative z-10">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentIdx || status === "COMPLETED";
            const isActive = idx === currentIdx;

            return (
              <div key={stage.id} className="flex flex-col items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 font-bold text-sm ${
                  isCompleted ? "bg-surgical-navy text-white shadow-lg shadow-surgical-navy/20" :
                  isActive ? "bg-surgical-navy text-white ring-4 ring-blue-50" :
                  "bg-white border-2 border-slate-100 text-slate-300"
                }`}>
                  {isCompleted ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${
                  isActive ? "text-surgical-navy" : "text-slate-400"
                }`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CampaignWorkspace = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("research");
  const [monitorTab, setMonitorTab] = useState("monitor"); // monitor, drafts
  const [discoveryTab, setDiscoveryTab] = useState("drafts"); // drafts, scheduled
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refineAnswers, setRefineAnswers] = useState({});
  const [researchTab, setResearchTab] = useState("mission_briefing");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [previewDraft, setPreviewDraft] = useState(null);
  const [draftEditData, setDraftEditData] = useState({ subject: "", body: "", email: "" });
  const [sendingId, setSendingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dispatchingId, setDispatchingId] = useState(null);
  const [isDispatchingAll, setIsDispatchingAll] = useState(false);
  const [draftFilter, setDraftFilter] = useState(null);   // null = show all
  const [showDraftFilter, setShowDraftFilter] = useState(false);
  const [expandedReportCompany, setExpandedReportCompany] = useState(null);
  const [showHistoryDM, setShowHistoryDM] = useState(null);
  const [highlightedDraftId, setHighlightedDraftId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);

  // Close the draft filter dropdown on any outside click
  useEffect(() => {
    if (!showDraftFilter) return;
    const handler = (e) => {
      if (!e.target.closest("[data-draft-filter]")) setShowDraftFilter(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDraftFilter]);

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

  // Dynamic, consolidated chronological sequence builder
  const getUnifiedHistory = (dm) => {
    if (!dm) return [];
    const events = [];

    const dmCreatedDate = parseUtcDate(dm.created_at || campaign?.created_at);
    const dmCreatedTime = dmCreatedDate?.getTime() || 0;

    // 1. Prospect Identified Event (Milestone 1)
    if (dmCreatedDate) {
      events.push({
        type: "PROSPECT_IDENTIFIED",
        timestamp: dmCreatedDate,
        title: "Prospect Qualified",
        label: "Stage 5: Stakeholder Profiling",
        icon: Target,
        color: "text-red-500 bg-red-50 border-red-100",
        content: {
          score: dm.relevance_score,
          reason: dm.relevance_explanation || dm.similarity_score?.reason || "Lead qualified through high-fidelity strategic matching."
        }
      });
    }

    // 2. Draft Events (Only pending/unsent drafts to prevent duplicate representations)
    const dmDrafts = campaign?.drafts?.filter(d => String(d.decision_maker_id) === String(dm.id)) || [];
    dmDrafts.forEach(draft => {
      const draftDate = parseUtcDate(draft.created_at);
      // Exclude drafts already dispatched (status === "SENT") to prevent duplicates with sent logs
      if (draftDate && draft.status !== "SENT") {
        events.push({
          type: "EMAIL_DRAFTED",
          timestamp: draftDate,
          title: `Outreach Protocol Drafted (${draft.draft_type || "INITIAL"})`,
          label: "Stage 6: Ghostwriting Pipeline",
          icon: PenLine,
          color: "text-amber-500 bg-amber-50 border-amber-100",
          content: {
            subject: draft.subject,
            body: draft.body,
            isApproved: draft.is_approved,
            status: draft.status,
            id: draft.id
          }
        });
      }
    });

    // 3. Communication Logs (Sent and Received)
    const dmLogs = dm.logs || [];
    dmLogs.forEach(log => {
      const timestamp = log.received_at || log.created_at;
      const logDate = parseUtcDate(timestamp);
      if (logDate) {
        const logTime = logDate.getTime();
        // Filter out historical background logs that occurred before this prospect was qualified
        if (dmCreatedTime && logTime < dmCreatedTime - 60000) {
          return;
        }

        if (log.direction === "SENT") {
          events.push({
            type: "EMAIL_SENT",
            timestamp: logDate,
            title: "Outbound Dispatch Complete",
            label: "Mission Dispatch",
            icon: Send,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100",
            content: {
              subject: log.subject,
              body: log.body,
              id: log.id
            }
          });
        } else {
          events.push({
            type: "EMAIL_RECEIVED",
            timestamp: logDate,
            title: "Signal Captured (Reply)",
            label: "Inbound Signal",
            icon: MessageSquare,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
            content: {
              subject: log.subject,
              body: log.body,
              id: log.id
            }
          });
        }
      }
    });

    // Sort chronologically ascending (oldest first at the top, newest at the bottom)
    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
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
        const res = await axios.post(`${API_BASE_URL}/drafts/${draftId}/send`);
        const data = res.data;
        if (data.message === "already_scheduled") {
            alert(`Already scheduled: Email to ${name} is queued for ${data.display}.`);
        } else if (data.scheduled_at) {
            alert(`Scheduled: Email to ${name} will be sent on ${data.display} (${data.timezone}).`);
        } else {
            alert(`Engagement protocol targeting ${name} has been deployed.`);
        }
        await fetchCampaignDetails();
    } catch (error) {
        console.error("Tactical Deployment Failure:", error);
        const errorDetail = error.response?.data?.detail || "Strategic deployment failed. Please check your communication protocols.";
        alert(`ERROR: ${errorDetail}`);
    } finally {
        setSendingId(null);
    }
  };

  const handleDispatchNudge = async (dmId, name) => {
    setDispatchingId(dmId);
    try {
      const res = await axios.post(`${API_BASE_URL}/prospects/${dmId}/dispatch`);
      const data = res.data;
      if (data.message === "already_scheduled") {
        alert(`Already queued: Reminder to ${name} is scheduled for ${data.display}.`);
      } else {
        alert(`Dispatch scheduled: Reminder to ${name} will be sent on ${data.display} (${data.timezone}).`);
      }
      await fetchCampaignDetails();
    } catch (error) {
      const detail = error.response?.data?.detail || "Dispatch failed.";
      alert(`ERROR: ${detail}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleDispatchAll = async () => {
    if (!campaign?.id) return;
    setIsDispatchingAll(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/campaigns/${campaign.id}/drafts/dispatch-all`);
      const { scheduled_count, skipped_count, error_count } = res.data;
      let msg = `Dispatch All complete.\n✅ Scheduled: ${scheduled_count}`;
      if (skipped_count > 0) msg += `\n⏭ Skipped: ${skipped_count} (already queued or sent)`;
      if (error_count > 0) msg += `\n⚠️ Errors: ${error_count}`;
      alert(msg);
      await fetchCampaignDetails();
    } catch (error) {
      const detail = error.response?.data?.detail || "Batch dispatch failed.";
      alert(`ERROR: ${detail}`);
    } finally {
      setIsDispatchingAll(false);
    }
  };

  // States that support manual nudge dispatch
  const isDispatchable = (dm) => {
    const s = (dm.state || dm.status || "").toUpperCase();
    return (
      s === "INITIAL_SENT" ||
      s === "REMINDER_1_SENT" ||
      s === "FOLLOWUP_ACTIVE" ||
      s === "WAITING_FOR_REPLY"
    );
  };

  const handleUpdatePrompt = async (newPrompt) => {
    setIsSaving(true);
    try {
      await axios.patch(`${API_BASE_URL}/campaigns/${id}`, { prompt: newPrompt });
      await fetchCampaignDetails();
      setShowRefineModal(false);
      setRefineAnswers({});
      alert("Mission Briefing Successfully Updated. System re-validating...");
    } catch (error) {
      console.error("Error updating prompt:", error);
      alert("Failed to synchronize mission refinement.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefineSubmit = () => {
    // Combine original prompt with answers to questions
    const answersText = Object.entries(refineAnswers)
      .map(([q, a]) => `Q: ${q}\nA: ${a}`)
      .join("\n\n");
    
    const enhancedPrompt = `${campaign.prompt}\n\n--- Clarification Updates ---\n${answersText}`;
    handleUpdatePrompt(enhancedPrompt);
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

    // Strategic Backend Status Mapping (6-Stage V3)
    switch (String(campaign.status).toUpperCase()) {
      case "INPUT_VALIDATED": return "INPUT VALIDATED";
      case "PENDING": return "CSV INGESTION";
      case "STAGE_1_CSV_TRIMMED": return "DATA FILTERING";
      case "STAGE_2_USER_INTEL_COMPLETE": return "BRAND ANALYSIS";
      case "STAGE_3_ICP_FILTERED": return "GATEKEEPER VALIDATION";
      case "STAGE_4_RESEARCH_COMPLETE": return "DEEP RESEARCH";
      case "STAGE_5_STAKEHOLDERS_RANKED": return "PERSONA MAPPING";
      case "STAGE_6_DRAFTING_COMPLETE": return "ENGAGEMENT READY";
      case "COMPLETED": return "MISSION FINISHED";
      case "INTERVENTION_NEEDED": return "INTERVENTION REQUIRED";
      default: return campaign.status || "NEW";
    }
  };

  const hasDrafts = campaign.drafts_count > 0;

  return (
    <div className="flex h-[calc(100vh-74px)] overflow-hidden bg-surgical-bg font-sans select-none">
      <MissionSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        campaignName={campaign.name} 
      />

      <div className="flex-grow flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-surgical-border px-10 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-6">
            <Link 
              to="/active" 
              className="p-2.5 bg-slate-50 border border-surgical-border text-slate-400 hover:text-surgical-navy rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="h-8 w-px bg-slate-100" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
              Mission Control
            </h1>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-surgical-navy uppercase tracking-widest leading-none">Operation Lifecycle</span>
               <span className="text-[11px] font-black text-slate-900 border-b-2 border-surgical-navy tracking-tighter uppercase">{getDisplayStatus()}</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
               <Activity size={20} />
             </div>
          </div>
        </header>

        <ProgressTracker status={campaign.status} />

        {campaign.status === "INTERVENTION_NEEDED" && (
          <div className="bg-amber-50 border-y border-amber-200 px-10 py-6 animate-pulse-subtle">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-200 shadow-sm">
                  <AlertCircle size={24} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Strategic Intervention Required</h3>
                  <p className="text-xs font-bold text-amber-700/80 max-w-2xl leading-relaxed">
                    AI Intelligence has identified gaps in your mission briefing. 
                    <span className="block mt-1 font-black uppercase text-[10px]">
                      Missing: {campaign.input_validation_review?.missing_elements?.join(", ") || "Clarity in target/objective"}
                    </span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowRefineModal(true)}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-600/10 flex items-center gap-2 shrink-0"
              >
                <Edit3 size={14} /> Refine Briefing
              </button>
            </div>
          </div>
        )}

        <main className="flex-grow overflow-y-auto bg-surgical-bg">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <LeadLedger campaign={campaign} hideSidebar={true} />
              </motion.div>
            )}

            {activeTab === "research" && (
              <motion.div
                key="research"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <ResearchTabs 
                  campaign={campaign} 
                  researchTab={researchTab}
                  setResearchTab={setResearchTab}
                  setSelectedCompany={setSelectedCompany}
                  setSelectedDraft={setSelectedDraft}
                  setDraftEditData={setDraftEditData}
                  setActiveTab={setActiveTab}
                  onPreviewDraft={setPreviewDraft}
                />
              </motion.div>
            )}

            {activeTab === "monitor" && (
              <motion.div
                key="monitor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 max-w-[1600px] mx-auto space-y-8"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-4 select-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surgical-navy/5 text-surgical-navy rounded-xl flex items-center justify-center border border-surgical-navy/10 shadow-sm">
                      <BarChart3 size={20} strokeWidth={3} />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 bg-surgical-navy/5 text-surgical-navy border border-surgical-navy/10 rounded-lg text-[10px] font-black uppercase tracking-widest self-start mb-1 inline-block">Tactical Suite</span>
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase italic leading-none">Outreach Hub</h3>
                    </div>
                  </div>

                  {/* Sub-Navigation Tabs */}
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-surgical-border shadow-sm">
                    <button
                      onClick={() => setMonitorTab("monitor")}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        monitorTab === "monitor"
                          ? "bg-surgical-navy text-white shadow-lg shadow-surgical-navy/20"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Activity size={14} />
                      Monitor
                    </button>
                    <button
                      onClick={() => setMonitorTab("drafts")}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        monitorTab === "drafts"
                          ? "bg-surgical-navy text-white shadow-lg shadow-surgical-navy/20"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Mail size={14} />
                      Drafts Outreach
                    </button>
                  </div>
                </div>

                {monitorTab === "monitor" ? (
                  <div className="bg-white rounded-[32px] border border-surgical-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholder Protocol</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Live Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {(campaign.dms || []).filter(dm => !["NEW", "SYNCED"].includes(dm.state || dm.status)).length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-8 py-20 text-center">
                                <div className="flex flex-col items-center gap-4 text-slate-300">
                                  <Inbox size={40} strokeWidth={1} className="opacity-20 text-surgical-navy" />
                                  <p className="text-xs font-bold uppercase tracking-widest italic">Awaiting initial signal deployment...</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            (campaign.dms || []).filter(dm => !["NEW", "SYNCED"].includes(dm.state || dm.status)).map(dm => {
                              const co = campaign.target_companies.find(c => c.id === dm.target_company_id);
                              const dmStatus = dm.state || dm.status || "NEW";

                              // Check if this DM has a pending scheduled draft
                              const scheduledDraft = (campaign.drafts || []).find(
                                d => d.decision_maker_id === dm.id &&
                                     d.status === "DRAFTED" &&
                                     d.dispatch_state === "QUEUED" &&
                                     d.scheduled_at
                              );
                              const hasScheduledDispatch = !!scheduledDraft;

                              // Format the scheduled slot for tooltip / secondary label
                              const scheduledLabel = (() => {
                                if (!scheduledDraft?.scheduled_at) return null;
                                const raw = String(scheduledDraft.scheduled_at).endsWith("Z")
                                  ? scheduledDraft.scheduled_at
                                  : scheduledDraft.scheduled_at + "Z";
                                const d = new Date(raw);
                                if (isNaN(d.getTime())) return null;
                                return d.toLocaleString("en-US", {
                                  weekday: "short", month: "short", day: "numeric",
                                  hour: "numeric", minute: "2-digit",
                                  timeZoneName: "short",
                                  timeZone: dm.display_timezone || undefined,
                                });
                              })();

                              return (
                                <tr key={dm.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${
                                        hasScheduledDispatch
                                          ? "bg-blue-50 text-blue-600 border-blue-100"
                                          : "bg-surgical-navy/5 text-surgical-navy border-surgical-navy/10"
                                      }`}>
                                        {(dm.name || "P").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{dm.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dm.position || "Decision Maker"}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-8 py-6 text-sm font-bold text-slate-500 uppercase">{co?.name}</td>
                                  <td className="px-8 py-6 text-center">
                                    {hasScheduledDispatch ? (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter bg-blue-50 text-blue-600 border border-blue-200">
                                          Dispatch Scheduled
                                        </span>
                                        {scheduledLabel && (
                                          <span className="text-[9px] font-bold text-slate-400 tracking-tight">
                                            {scheduledLabel}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                        dmStatus.includes("SENT")   ? "bg-surgical-navy text-white" :
                                        dmStatus.includes("REPLIED") ? "bg-emerald-500 text-white" :
                                        dmStatus.includes("DRAFTED") ? "bg-amber-50 text-amber-600 border border-amber-200" :
                                        "bg-slate-100 text-slate-500"
                                      }`}>
                                        {dmStatus.replace(/_/g, " ")}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-8 py-6">
                                    <div className="flex items-center justify-end gap-2">
                                      {/* Hide Dispatch button when a send is already scheduled */}
                                      {isDispatchable(dm) && !hasScheduledDispatch && (
                                        <button
                                          onClick={() => handleDispatchNudge(dm.id, dm.name)}
                                          disabled={dispatchingId === dm.id}
                                          className="flex items-center gap-1.5 px-3 py-2 bg-surgical-navy hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm shadow-surgical-navy/20 disabled:opacity-50"
                                        >
                                          {dispatchingId === dm.id
                                            ? <Loader2 size={11} className="animate-spin" />
                                            : <Send size={11} />}
                                          Dispatch
                                        </button>
                                      )}
                                      <button
                                        onClick={() => setShowHistoryDM(dm)}
                                        className="px-4 py-2 bg-slate-50 hover:bg-surgical-navy hover:text-white text-slate-400 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                      >
                                        View Chain
                                      </button>
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
                ) : (
                  (() => {
                    // All non-discovery pending drafts (includes already-scheduled ones so they stay visible)
                    const standardDrafts = (campaign.drafts || []).filter(
                      d => d.status === "DRAFTED" && d.draft_type !== "DISCOVERY"
                    );

                    // Helper: is this draft locked (already queued for scheduled send)?
                    const isDraftScheduled = (d) => d.dispatch_state === "QUEUED" && !!d.scheduled_at;

                    // Derive unique prospect states present in this draft set
                    // Scheduled drafts show their own "DISPATCH_SCHEDULED" synthetic state
                    const uniqueStates = [...new Set(
                      standardDrafts.map(d => {
                        if (isDraftScheduled(d)) return "DISPATCH_SCHEDULED";
                        const dm = campaign.dms?.find(m => m.id === d.decision_maker_id);
                        return (dm?.state || dm?.status || "DRAFTED").toUpperCase();
                      })
                    )].sort();

                    // Apply active filter (use synthetic state for scheduled drafts)
                    const visibleDrafts = draftFilter
                      ? standardDrafts.filter(d => {
                          if (isDraftScheduled(d)) return draftFilter === "DISPATCH_SCHEDULED";
                          const dm = campaign.dms?.find(m => m.id === d.decision_maker_id);
                          return (dm?.state || dm?.status || "DRAFTED").toUpperCase() === draftFilter;
                        })
                      : standardDrafts;

                    // Status badge colour map (also used for filter dropdown chips)
                    const statusBadge = (state) => {
                      const s = (state || "DRAFTED").toUpperCase();
                      const label = s.replace(/_/g, " ");
                      let cls = "bg-slate-50 text-slate-500 border-slate-200";
                      if (s === "DISPATCH_SCHEDULED") cls = "bg-blue-50 text-blue-600 border-blue-200";
                      else if (s === "DRAFTED")        cls = "bg-amber-50 text-amber-600 border-amber-200";
                      else if (s === "INITIAL_SENT")   cls = "bg-indigo-50 text-indigo-600 border-indigo-200";
                      else if (s === "REMINDER_1_SENT" || s === "REMINDER_2_SENT")
                                                       cls = "bg-purple-50 text-purple-600 border-purple-200";
                      else if (s === "FOLLOWUP_ACTIVE") cls = "bg-teal-50 text-teal-600 border-teal-200";
                      else if (s === "NEUTRAL")        cls = "bg-slate-100 text-slate-600 border-slate-300";
                      return (
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${cls}`}>
                          {label}
                        </span>
                      );
                    };

                    return (
                      <div className="space-y-5">

                        {/* ── Header row: count + Filter + Dispatch All ── */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {visibleDrafts.length}
                            {draftFilter ? ` of ${standardDrafts.length}` : ""} pending draft{visibleDrafts.length !== 1 ? "s" : ""}
                            {draftFilter && (
                              <span className="ml-2 text-indigo-500">
                                — {draftFilter.replace(/_/g, " ")}
                              </span>
                            )}
                          </p>

                          <div className="flex items-center gap-2 relative">
                            {/* Filter button */}
                            <div className="relative" data-draft-filter>
                              <button
                                onClick={() => setShowDraftFilter(prev => !prev)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${
                                  draftFilter
                                    ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <Filter size={12} />
                                {draftFilter ? draftFilter.replace(/_/g, " ") : "Filter"}
                                <ChevronDown size={11} className={`transition-transform ${showDraftFilter ? "rotate-180" : ""}`} />
                              </button>

                              {/* Dropdown */}
                              <AnimatePresence>
                                {showDraftFilter && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-2 min-w-[200px]"
                                  >
                                    {/* All option */}
                                    <button
                                      onClick={() => { setDraftFilter(null); setShowDraftFilter(false); }}
                                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        !draftFilter
                                          ? "bg-surgical-navy text-white"
                                          : "text-slate-500 hover:bg-slate-50"
                                      }`}
                                    >
                                      All Statuses
                                      <span className="ml-auto text-[9px] font-bold opacity-60">{standardDrafts.length}</span>
                                    </button>

                                    {/* One chip per unique status */}
                                    {uniqueStates.map(state => {
                                      const count = standardDrafts.filter(d => {
                                        if (isDraftScheduled(d)) return state === "DISPATCH_SCHEDULED";
                                        const m = campaign.dms?.find(x => x.id === d.decision_maker_id);
                                        return (m?.state || m?.status || "DRAFTED").toUpperCase() === state;
                                      }).length;
                                      return (
                                        <button
                                          key={state}
                                          onClick={() => { setDraftFilter(state); setShowDraftFilter(false); }}
                                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            draftFilter === state
                                              ? "bg-surgical-navy text-white"
                                              : "text-slate-500 hover:bg-slate-50"
                                          }`}
                                        >
                                          {state.replace(/_/g, " ")}
                                          <span className="ml-auto text-[9px] font-bold opacity-60">{count}</span>
                                        </button>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Dispatch All */}
                            <button
                              onClick={handleDispatchAll}
                              disabled={isDispatchingAll}
                              className="flex items-center gap-2 px-5 py-2.5 bg-surgical-navy hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-surgical-navy/20 disabled:opacity-50 active:scale-95"
                            >
                              {isDispatchingAll ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                              Dispatch All
                            </button>
                          </div>
                        </div>

                        {/* ── Draft card grid ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {visibleDrafts.length === 0 ? (
                            <div className="col-span-full bg-white rounded-[32px] border border-surgical-border p-20 text-center flex flex-col items-center gap-4">
                              <Mail size={48} className="text-slate-200" strokeWidth={1} />
                              <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">
                                {draftFilter
                                  ? `No drafts with status "${draftFilter.replace(/_/g, " ")}".`
                                  : "No pending outreach protocols drafted."}
                              </p>
                              {draftFilter && (
                                <button
                                  onClick={() => setDraftFilter(null)}
                                  className="text-[10px] font-black text-indigo-500 underline uppercase tracking-widest"
                                >
                                  Clear filter
                                </button>
                              )}
                            </div>
                          ) : (
                            visibleDrafts.map((draft) => {
                              const dm = campaign.dms?.find(d => d.id === draft.decision_maker_id);
                              const co = campaign.target_companies?.find(c => c.id === dm?.target_company_id);
                              const dmState = dm?.state || dm?.status || "DRAFTED";

                              // A draft is "locked" once it has been queued for scheduled dispatch
                              const isScheduled = draft.dispatch_state === "QUEUED" && !!draft.scheduled_at;

                              // Format the scheduled time for display on the card
                              const scheduledDisplay = (() => {
                                if (!draft.scheduled_at) return null;
                                const raw = String(draft.scheduled_at).endsWith("Z")
                                  ? draft.scheduled_at
                                  : draft.scheduled_at + "Z";
                                const d = new Date(raw);
                                if (isNaN(d.getTime())) return null;
                                return d.toLocaleString("en-US", {
                                  weekday: "short", month: "short", day: "numeric",
                                  hour: "numeric", minute: "2-digit",
                                  timeZoneName: "short",
                                  timeZone: dm?.display_timezone || undefined,
                                });
                              })();

                              return (
                                <motion.div
                                  key={draft.id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`bg-white rounded-[28px] border p-6 shadow-sm transition-all flex flex-col justify-between ${
                                    isScheduled
                                      ? "border-blue-100 bg-blue-50/20"
                                      : "border-surgical-border hover:shadow-xl hover:shadow-surgical-navy/5"
                                  }`}
                                >
                                  <div className="space-y-4">
                                    {/* Card header: avatar + name + STATUS BADGE */}
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-xs border ${
                                          isScheduled
                                            ? "bg-blue-50 text-blue-600 border-blue-100"
                                            : "bg-red-50 text-red-600 border-red-100"
                                        }`}>
                                          {(dm?.name || "P").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{dm?.name}</p>
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{co?.name}</p>
                                        </div>
                                      </div>

                                      {/* Status badge — "DISPATCH SCHEDULED" overrides prospect state */}
                                      {isScheduled ? (
                                        <span className="shrink-0 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-200 whitespace-nowrap">
                                          Dispatch Scheduled
                                        </span>
                                      ) : (
                                        statusBadge(dmState)
                                      )}
                                    </div>

                                    {/* Scheduled time line */}
                                    {isScheduled && scheduledDisplay && (
                                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                                        <Clock size={11} className="text-blue-400 shrink-0" />
                                        <p className="text-[10px] font-bold text-blue-600 truncate">
                                          {scheduledDisplay}
                                        </p>
                                      </div>
                                    )}

                                    <div className="space-y-2">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1">Subject</p>
                                      <p className="text-xs font-bold text-slate-800 line-clamp-1 italic">{draft.subject}</p>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1 mt-3">Message Snippet</p>
                                      <p className="text-[11px] font-medium text-slate-500 line-clamp-3 leading-relaxed">
                                        {draft.body.replace(/<[^>]*>/g, '').slice(0, 150)}...
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 mt-8">
                                    <button
                                      onClick={() => {
                                        if (isScheduled) return;
                                        setDraftEditData({ subject: draft.subject, body: draft.body, email: dm?.email || "" });
                                        setSelectedDraft(draft);
                                      }}
                                      disabled={isScheduled}
                                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      <Edit3 size={14} /> Refine
                                    </button>
                                    <button
                                      onClick={() => { if (!isScheduled) handleSendMessage(draft.id, dm?.name); }}
                                      disabled={isScheduled || sendingId === draft.id}
                                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surgical-navy hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-surgical-navy/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      {sendingId === draft.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                      {isScheduled ? "Queued" : "Deploy"}
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 max-w-[1600px] mx-auto space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surgical-navy/5 text-surgical-navy rounded-xl flex items-center justify-center border border-surgical-navy/10 shadow-sm">
                      <PhoneCall size={20} strokeWidth={3} />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 bg-surgical-navy/5 text-surgical-navy border border-surgical-navy/10 rounded-lg text-[10px] font-black uppercase tracking-widest self-start mb-1 inline-block">Coordination Protocol</span>
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase italic leading-none">Discovery Calls</h3>
                    </div>
                  </div>

                  {/* Sub-navigation for Discovery Calls */}
                  <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setDiscoveryTab("drafts")}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        discoveryTab === "drafts" ? "bg-white text-surgical-navy shadow-sm border border-slate-200/60" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                      }`}
                    >
                      <PhoneCall size={14} /> Pending Drafts
                    </button>
                    <button
                      onClick={() => setDiscoveryTab("scheduled")}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        discoveryTab === "scheduled" ? "bg-white text-surgical-navy shadow-sm border border-slate-200/60" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                      }`}
                    >
                      <Calendar size={14} /> Scheduled Meetings
                    </button>
                  </div>
                </div>

                {discoveryTab === "drafts" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    const discoveryDrafts = (campaign.drafts || []).filter(d => d.status === "DRAFTED" && d.draft_type === "DISCOVERY");
                    if (discoveryDrafts.length === 0) {
                      return (
                        <div className="col-span-full bg-white rounded-[32px] border border-surgical-border p-20 text-center flex flex-col items-center gap-4">
                          <PhoneCall size={48} className="text-slate-200" strokeWidth={1} />
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No discovery calls pending coordination.</p>
                        </div>
                      );
                    }
                    return discoveryDrafts.map((draft) => {
                      const dm = campaign.dms?.find(d => d.id === draft.decision_maker_id);
                      const co = campaign.target_companies?.find(c => c.id === dm?.target_company_id);
                      return (
                        <motion.div
                          key={draft.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white rounded-[28px] border border-surgical-border p-6 shadow-sm hover:shadow-xl hover:shadow-surgical-navy/5 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs border border-amber-100">
                                  {(dm?.name || "P").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{dm?.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{co?.name}</p>
                                </div>
                              </div>
                              <div className="px-2 py-1 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                Discovery
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1">Subject</p>
                              <p className="text-xs font-bold text-slate-800 line-clamp-1 italic">{draft.subject}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1 mt-3">Message Snippet</p>
                              <p className="text-[11px] font-medium text-slate-500 line-clamp-3 leading-relaxed">
                                {draft.body.replace(/<[^>]*>/g, '').slice(0, 150)}...
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-8">
                            <button
                              onClick={() => {
                                setDraftEditData({ subject: draft.subject, body: draft.body, email: dm?.email || "" });
                                setSelectedDraft(draft);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100"
                            >
                              <Edit3 size={14} /> Refine
                            </button>
                            <button
                              onClick={() => handleSendMessage(draft.id, dm?.name)}
                              disabled={sendingId === draft.id}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surgical-navy hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-surgical-navy/20 disabled:opacity-50"
                            >
                              {sendingId === draft.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                              Deploy
                            </button>
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
                  </div>
                ) : (
                  <div className="bg-white rounded-[32px] border border-surgical-border overflow-hidden shadow-sm">
                    <div className="px-10 py-6 border-b border-surgical-border flex items-center justify-between bg-slate-50/30">
                      <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Scheduled Intelligence Briefings</h3>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {(campaign.dms || []).filter(dm => dm.status === "MEETING_BOOKED" || dm.scheduled_time_utc).length} Booked
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-surgical-border">
                            <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Prospect</th>
                            <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Organization</th>
                            <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5"><Calendar size={11} strokeWidth={3} /> Meeting Date</span>
                            </th>
                            <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5"><Clock size={11} strokeWidth={3} /> Meeting Time</span>
                            </th>
                            <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Coordinate</th>
                            <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Time Remaining</th>
                            <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surgical-border bg-white">
                          {(() => {
                            const scheduledDMs = (campaign.dms || []).filter(dm => dm.status === "MEETING_BOOKED" || dm.scheduled_time_utc);
                            if (scheduledDMs.length === 0) {
                              return (
                                <tr>
                                  <td colSpan="7" className="py-20 text-center">
                                    <Calendar size={48} className="text-slate-200 mx-auto mb-4" strokeWidth={1} />
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No meetings scheduled.</p>
                                  </td>
                                </tr>
                              );
                            }
                            return scheduledDMs.map(dm => {
                              const co = campaign.target_companies?.find(c => c.id === dm.target_company_id);
                              const meetingDate = formatMeetingDate(dm.scheduled_time_utc, dm.display_timezone);
                              const meetingTime = formatMeetingTime(dm.scheduled_time_utc, dm.display_timezone);
                              const isPast = dm.scheduled_time_utc && new Date(dm.scheduled_time_utc + "Z") < new Date();
                              return (
                                <tr key={dm.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-5 px-8">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-surgical-navy/5 text-surgical-navy flex items-center justify-center font-black text-[10px] border border-surgical-navy/10 shrink-0">
                                        {(dm.name || "P").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{dm.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{dm.position || "Stakeholder"}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-5 px-8 text-xs font-bold text-slate-700">{co?.name || "Unknown"}</td>
                                  <td className="py-5 px-8">
                                    {dm.scheduled_time_utc ? (
                                      <div className="flex flex-col gap-0.5">
                                        <span className={`text-xs font-black uppercase tracking-tight ${isPast ? "text-slate-400" : "text-slate-900"}`}>
                                          {meetingDate}
                                        </span>
                                        {isPast && (
                                          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Elapsed</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">TBD</span>
                                    )}
                                  </td>
                                  <td className="py-5 px-8">
                                    {dm.scheduled_time_utc ? (
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap border ${
                                        isPast
                                          ? "bg-slate-50 text-slate-400 border-slate-100"
                                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                      }`}>
                                        <Clock size={11} strokeWidth={3} />
                                        {meetingTime}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">TBD</span>
                                    )}
                                  </td>
                                  <td className="py-5 px-8 text-xs text-slate-500 font-medium">{dm.email}</td>
                                  <td className="py-5 px-8">
                                    <span className={`px-3 py-1 border rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap inline-flex items-center gap-1.5 ${
                                      isPast
                                        ? "bg-slate-50 text-slate-400 border-slate-100"
                                        : "bg-amber-50 text-amber-600 border-amber-100"
                                    }`}>
                                      <Clock size={12} strokeWidth={3} /> {formatTimeLeft(dm.scheduled_time_utc)}
                                    </span>
                                  </td>
                                  <td className="py-5 px-8 text-right">
                                    {dm.meeting_link ? (
                                      <a href={dm.meeting_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-surgical-navy text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 shadow-sm shadow-surgical-navy/10">
                                        <Link2 size={12} /> Join Link
                                      </a>
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TBA</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                )}
              </motion.div>
            )}

            {activeTab === "report" && (
              <motion.div
                key="report"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 max-w-[1600px] mx-auto space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: "Target Profiles", value: campaign.target_companies_count, icon: Search, color: "text-surgical-navy", bg: "bg-surgical-navy/5 border border-surgical-navy/10" },
                    { label: "Pipeline Status", value: campaign.status === "COMPLETED" ? "FINISHED" : "ACTIVE", icon: Activity, color: "text-surgical-navy", bg: "bg-surgical-navy/5 border border-surgical-navy/10" },
                    { label: "Mission Impact", value: `${Math.round((campaign.dms || []).filter(d => d.status === 'MEETING_BOOKED').length / (campaign.target_companies_count || 1) * 100)}%`, icon: Target, color: "text-surgical-navy", bg: "bg-surgical-navy/5 border border-surgical-navy/10" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[32px] border border-surgical-border shadow-sm flex items-center gap-6">
                      <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
                        <stat.icon size={28} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                        <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">{stat.value}</h4>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[32px] border border-surgical-border overflow-hidden shadow-sm">
                   <div className="px-10 py-6 border-b border-surgical-border flex items-center justify-between bg-slate-50/30">
                      <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Intelligence Repository</h3>
                      <span className="px-3 py-1 bg-surgical-navy/5 text-surgical-navy border border-surgical-navy/10 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {campaign.target_companies.length} Records Profiled
                      </span>
                   </div>
                   <div className="divide-y divide-slate-50">
                      {campaign.target_companies.map(company => (
                        <div key={company.id} className="px-10 py-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-surgical-navy/5 text-surgical-navy rounded-xl flex items-center justify-center font-black text-sm border border-surgical-navy/10">
                                 {company.name[0].toUpperCase()}
                              </div>
                              <div>
                                 <h4 className="font-extrabold text-slate-900 uppercase tracking-tight leading-none mb-1">{company.name}</h4>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{company.location || "Global Ops"}</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => setSelectedCompany(company)}
                             className="text-[10px] font-black text-surgical-navy uppercase tracking-widest underline underline-offset-4 decoration-2 decoration-surgical-navy/20 hover:text-surgical-navy/70 transition-all"
                           >
                              Access Intelligence
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

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
                                {selectedCompany.relevance_explanation ? `"${selectedCompany.relevance_explanation}"` : "Strategic alignment verified via target sector analysis."}
                             </p>
                          </div>

                          {/* Detail Grid */}
                          <div className="space-y-3 pt-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Attributes</p>
                             <div className="grid grid-cols-1 gap-2.5">
                                <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-start gap-3.5 group hover:border-red-100/60 transition-all shadow-sm">
                                   <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 transition-colors shrink-0">
                                      <Monitor size={16} />
                                   </div>
                                   <div>
                                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Headquarters</p>
                                      <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{selectedCompany.location || "Global Operations"}</p>
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
                                {selectedCompany.research_summary || selectedCompany.deep_research || "No deep research data available for this entity."}
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
      <DraftEditorModal
        selectedDraft={selectedDraft}
        campaign={campaign}
        draftEditData={draftEditData}
        onDraftEditChange={setDraftEditData}
        onClose={() => setSelectedDraft(null)}
        onSave={handleSaveDraft}
        isSaving={isSaving}
      />

      {/* Draft Preview Modal (Read Only) */}
      <DraftPreviewModal
        selectedDraft={previewDraft}
        campaign={campaign}
        onClose={() => setPreviewDraft(null)}
      />

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
                {/* Visual Connection Line */}
                <div className="absolute left-[42px] md:left-[50px] top-12 bottom-12 w-[2px] bg-slate-100 z-0" />
                
                {getUnifiedHistory(showHistoryDM).map((event, idx) => {
                  const Icon = event.icon;
                  const isExpanded = expandedNodes.includes(event.type + idx);
                  
                  return (
                    <div key={idx} className="relative flex gap-5 md:gap-6 z-10">
                      <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shadow-sm shrink-0 ${event.color}`}>
                        <Icon size={16} strokeWidth={2.5} />
                      </div>
                      
                      <div 
                        onClick={() => toggleNodeExpansion(event.type + idx)}
                        className="bg-white p-5 rounded-2xl border border-slate-100/80 shadow-sm flex-grow cursor-pointer hover:bg-slate-50/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            {event.label} • {formatTimeAgo(event.timestamp)}
                          </p>
                          {event.content.id && (
                            <div className="p-1 px-1.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                              Sync ID: #{String(event.content.id).slice(-4)}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs font-extrabold text-slate-800 uppercase italic tracking-tight mb-2">
                          {event.type === "PROSPECT_IDENTIFIED" 
                            ? `${event.title} (Score: ${event.content.score}/100)` 
                            : event.type === "EMAIL_DRAFTED"
                              ? `Subject: ${event.content.subject}`
                              : `Subject: ${event.content.subject}`
                          }
                        </p>
                        
                        <div className={`text-sm leading-relaxed text-slate-600 font-medium ${isExpanded ? '' : 'line-clamp-3'}`}>
                          {event.type === "PROSPECT_IDENTIFIED" ? (
                            <p className="italic">"{event.content.reason}"</p>
                          ) : (
                            <p className="whitespace-pre-wrap italic bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                              {cleanEmailReply(event.content.body)}
                            </p>
                          )}
                        </div>
                        
                        {event.type === "EMAIL_DRAFTED" && (
                          <div className="mt-3 flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                              event.content.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {event.content.isApproved ? "Approved" : "Awaiting Approval"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowHistoryDM(null);
                                scrollToDraft(showHistoryDM.id);
                              }}
                              className="text-[9px] font-black text-surgical-navy hover:underline uppercase tracking-wider"
                            >
                              Go to draft Editor →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Refinement Modal - Moved out of the drawer for clean independent rendering */}
      <AnimatePresence>
        {showRefineModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRefineModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-10 overflow-y-auto max-h-[90vh] z-10 border border-slate-100"
            >
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
                    <HelpCircle size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Mission Intelligence Refinement</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Provide the missing coordinates to mobilize research.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {(campaign.input_validation_review?.clarification_questions || ["Could you provide more detail on your target audience and value proposition?"]).map((q, i) => (
                    <div key={i} className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-5 h-5 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-[8px]">{i+1}</span>
                        {q}
                      </label>
                      <textarea 
                        value={refineAnswers[q] || ""}
                        onChange={(e) => setRefineAnswers({ ...refineAnswers, [q]: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium text-slate-700 outline-none focus:border-amber-500/30 transition-all min-h-[80px] resize-none"
                        placeholder="Type your response here..."
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    onClick={() => setShowRefineModal(false)}
                    className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRefineSubmit}
                    disabled={isSaving || Object.keys(refineAnswers).length === 0}
                    className="flex-[2] py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-200 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-amber-600/10 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Synchronize Refinements
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignWorkspace;
