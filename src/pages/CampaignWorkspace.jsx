import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Mail,
  CheckCircle2, Loader2, AlertCircle,
  ArrowLeft, ExternalLink,
  MessageSquare, ChevronRight,
  Monitor, PhoneCall,
  X, Edit3, Send, Trash, Maximize2, Clock, Calendar, Link2,
  TrendingUp, PieChart, Target, ShieldCheck, LayoutDashboard,
  Filter, ChevronDown,
  PenLine, Inbox, HelpCircle
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import LeadLedger from "./LeadLedger";
import ResearchTabs from "./ResearchTabs";
import { CompanyDetailModal } from "../components/campaign-workspace/CompanyDetailModal";
import MissionSidebar from "../components/campaign-workspace/MissionSidebar";
import DraftEditorModal from "../components/campaign-workspace/DraftEditorModal";
import DraftPreviewModal from "../components/campaign-workspace/DraftPreviewModal";
import { CampaignWorkspaceSidebar } from "../components/campaign-workspace/CampaignWorkspaceSidebar";
import { DispatchConfirmModal } from "../components/campaign-workspace/DispatchConfirmModal";
import { AppHeader } from "../components/AppHeader";
import { useToast } from "../context/ToastContext";

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
  } catch {
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

// A reminder draft's followup_index is stored as 100 + reminder_number (see backend/app/services/reminder_sequence.py).
const REMINDER_INDEX_BASE = 100;

// Translates raw backend prospect/draft states into plain-English status labels + badge colors.
// `draft` (optional) is the actual pending EmailDraft row, used to tell "initial" vs "follow-up N" apart
// since the backend often leaves dm.state stale (pointing at the previous SENT stage) while a new
// draft is awaiting human approval — see reminder_sequence.py's record_reminder_draft().
const getFriendlyStatus = (rawState, draft = null) => {
  const s = (rawState || "DRAFTED").toUpperCase();

  if (s === "DISPATCH_SCHEDULED") {
    return { label: "Scheduled", cls: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  if (s === "DRAFTED") {
    if (draft?.draft_type === "REMINDER") {
      const n = (draft.followup_index || 0) - REMINDER_INDEX_BASE;
      return {
        label: `Follow-up ${n > 0 ? n : 1} Drafted (Human Approval)`,
        cls: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    if (draft?.draft_type === "FOLLOWUP" || draft?.draft_type === "DISCOVERY") {
      return { label: "Scheduling Email Drafted (Human Approval)", cls: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    return { label: "Initial Drafted (Human Approval)", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (s === "INITIAL_SENT") {
    return { label: "Initial Sent", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  }
  const reminderMatch = s.match(/^REMINDER_([1-6])_SENT$/);
  if (reminderMatch) {
    return { label: `Follow-up ${reminderMatch[1]} Sent`, cls: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  }
  if (s === "WAITING_FOR_REPLY") {
    return { label: "Waiting for Reply", cls: "bg-purple-50 text-purple-700 border-purple-200" };
  }
  if (s === "FOLLOWUP_ACTIVE") {
    return { label: "Scheduling Email Sent", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  }
  if (s === "POSITIVE") {
    return { label: "Discovery Call", cls: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  if (s === "DISCOVERY_CALL" || s === "MEETING_BOOKED") {
    return { label: "Meeting Booked", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  if (s === "NEGATIVE" || s === "TERMINATED") {
    return { label: "Terminated", cls: "bg-rose-50 text-rose-700 border-rose-200" };
  }
  if (s === "NEUTRAL") {
    return { label: "Neutral", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  }
  if (s === "ON_HOLD") {
    return { label: "On Hold", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  }
  if (s === "DISCOVERY_EXPIRED") {
    return { label: "Discovery Expired", cls: "bg-rose-50 text-rose-600 border-rose-200" };
  }
  return { label: s.replace(/_/g, " "), cls: "bg-slate-100 text-slate-600 border-slate-200" };
};

// Windowed page list so pagination never overflows the page width (e.g. 1 ... 4 5 6 ... 50)
const getPageWindow = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("...");
    out.push(p);
  });
  return out;
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

  let currentIdx = stages.findIndex((s) => s.id === status);
  if (status === "COMPLETED") currentIdx = stages.length;

  return (
    <div className="relative min-w-[520px] max-w-[1200px] mx-auto select-none">
      {/* Connection line */}
      <div className="absolute top-[15px] left-0 right-0 h-[2px] bg-slate-100 z-0" />

      <div className="flex items-start justify-between relative z-10">
        {stages.map((stage, idx) => {
          const isCompleted = idx < currentIdx || status === "COMPLETED";
          const isActive = idx === currentIdx;

          return (
            <div key={stage.id} className="flex flex-col items-center gap-2 px-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 font-bold text-xs ${
                isCompleted ? "bg-surgical-navy text-white shadow-lg shadow-surgical-navy/20" :
                isActive ? "bg-surgical-navy text-white ring-4 ring-blue-50" :
                "bg-white border-2 border-slate-100 text-slate-300"
              }`}>
                {isCompleted ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest text-center transition-colors duration-500 whitespace-nowrap ${
                isActive ? "text-surgical-navy" : "text-slate-400"
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CampaignWorkspace = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("research");
  const [dashboardSubTab, setDashboardSubTab] = useState("DASHBOARD"); // DASHBOARD, PIPELINE, ANALYSIS
  const [dashboardExpanded, setDashboardExpanded] = useState(false);
  const [monitorTab, setMonitorTab] = useState("monitor"); // monitor, drafts
  const [monitorExpanded, setMonitorExpanded] = useState(false);
  const [discoveryTab, setDiscoveryTab] = useState("drafts"); // drafts, scheduled
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refineAnswers, setRefineAnswers] = useState({});
  const [researchTab, setResearchTab] = useState("mission_briefing");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyModalTab, setCompanyModalTab] = useState("research");
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [previewDraft, setPreviewDraft] = useState(null);
  const [draftEditData, setDraftEditData] = useState({ subject: "", body: "", email: "" });
  const [sendingId, setSendingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDispatchingAll, setIsDispatchingAll] = useState(false);
  const [draftFilter, setDraftFilter] = useState(null);   // null = show all
  const [showDraftFilter, setShowDraftFilter] = useState(false);
  const [monitorPage, setMonitorPage] = useState(1);
  const [monitorStatusFilter, setMonitorStatusFilter] = useState(null); // null = show all
  const [showMonitorFilter, setShowMonitorFilter] = useState(false);
  const [showHistoryDM, setShowHistoryDM] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [navOpen, setNavOpen] = useState(false); // mobile campaign-nav drawer
  const [campaignNavCollapsed, setCampaignNavCollapsed] = useState(false);
  const [researchExpanded, setResearchExpanded] = useState(true);

  // Dispatch confirmation modal state
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchModalData, setDispatchModalData] = useState({
    draftId: null,
    isDraft: true, // true for single draft, false for batch
    recipientName: "",
    recipientEmail: "",
    scheduledTime: null,
    pendingCount: 0,
  });
  const [isConfirmingDispatch, setIsConfirmingDispatch] = useState(false);

  useEffect(() => {
    if (activeTab === "research") setResearchExpanded(true);
    if (activeTab === "dashboard") setDashboardExpanded(true);
    if (activeTab === "monitor") setMonitorExpanded(true);
  }, [activeTab]);

  // Close the draft filter dropdown on any outside click
  useEffect(() => {
    if (!showDraftFilter) return;
    const handler = (e) => {
      if (!e.target.closest("[data-draft-filter]")) setShowDraftFilter(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDraftFilter]);

  // Close the monitor filter dropdown on any outside click
  useEffect(() => {
    if (!showMonitorFilter) return;
    const handler = (e) => {
      if (!e.target.closest("[data-monitor-filter]")) setShowMonitorFilter(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMonitorFilter]);

  const toggleNodeExpansion = (nodeId) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
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

  const handleSendMessage = async (draftId, name, email) => {
    // Fetch the preview slot WITHOUT scheduling anything, then show the modal.
    // The actual scheduling only happens when the user confirms.
    setSendingId(draftId);
    try {
      const res = await axios.get(`${API_BASE_URL}/drafts/${draftId}/next-slot`);
      const data = res.data;
      setDispatchModalData({
        draftId,
        isDraft: true,
        recipientName: name,
        recipientEmail: email || "",
        scheduledTime: data.scheduled_at,
        pendingCount: 0,
      });
      setShowDispatchModal(true);
    } catch (error) {
      console.error("Tactical Deployment Failure:", error);
      const errorDetail = error.response?.data?.detail || "Strategic deployment failed. Please check your communication protocols.";
      showToast({ tone: "error", title: "Deployment failed", description: errorDetail });
    } finally {
      setSendingId(null);
    }
  };

  const handleDispatchConfirm = async (mode) => {
    const { draftId, recipientName } = dispatchModalData;
    if (!draftId) return;

    setIsConfirmingDispatch(true);
    try {
      if (mode === "send-now") {
        await axios.post(`${API_BASE_URL}/drafts/${draftId}/send-now`);
        showToast({ tone: "success", title: "Queued", description: `Email to ${recipientName} queued for immediate delivery.` });
      } else {
        const res = await axios.post(`${API_BASE_URL}/drafts/${draftId}/send`);
        const data = res.data;
        if (data.message === "already_scheduled") {
          showToast({ tone: "info", title: "Already scheduled", description: `Email to ${recipientName} is queued for ${data.display}.` });
        } else {
          showToast({ tone: "success", title: "Scheduled", description: `Email to ${recipientName} scheduled for ${data.display}.` });
        }
      }
      setShowDispatchModal(false);
      await fetchCampaignDetails();
    } catch (error) {
      console.error("Dispatch error:", error);
      const errorDetail = error.response?.data?.detail || "Deployment failed.";
      showToast({ tone: "error", title: "Deployment failed", description: errorDetail });
    } finally {
      setIsConfirmingDispatch(false);
    }
  };

  const handleDispatchAll = async () => {
    if (!campaign?.id) return;
    setIsDispatchingAll(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/campaigns/${campaign.id}/drafts/dispatch-all`);
      const { scheduled_count, skipped_count, error_count } = res.data;
      let msg = `Scheduled: ${scheduled_count}`;
      if (skipped_count > 0) msg += ` · Skipped: ${skipped_count} (already queued or sent)`;
      if (error_count > 0) msg += ` · Errors: ${error_count}`;
      showToast({ tone: error_count > 0 ? "error" : "success", title: "Dispatch all complete", description: msg });
      await fetchCampaignDetails();
    } catch (error) {
      const detail = error.response?.data?.detail || "Batch dispatch failed.";
      showToast({ tone: "error", title: "Batch dispatch failed", description: detail });
    } finally {
      setIsDispatchingAll(false);
    }
  };

  const handleUpdatePrompt = async (newPrompt) => {
    setIsSaving(true);
    try {
      await axios.patch(`${API_BASE_URL}/campaigns/${id}`, { prompt: newPrompt });
      await fetchCampaignDetails();
      setShowRefineModal(false);
      setRefineAnswers({});
      showToast({ tone: "success", title: "Mission briefing updated", description: "System re-validating..." });
    } catch (error) {
      console.error("Error updating prompt:", error);
      showToast({ tone: "error", title: "Update failed", description: "Failed to synchronize mission refinement." });
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
      showToast({ tone: "success", title: "Draft saved" });
    } catch (error) {
      console.error("Error saving draft:", error);
      showToast({ tone: "error", title: "Save failed", description: "Failed to synchronize refinement." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" strokeWidth={3} />
        <p className="text-zinc-400 font-black uppercase text-xs tracking-widest">Reconstructing Workspace...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 bg-white p-10 text-center">
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
      case "RESEARCHING_USER_COMPANY": return "BRAND ANALYSIS";
      case "PARTIAL_SUCCESS": return "PARTIALLY COMPLETE";
      case "FAILED": return "FAILED";
      case "INACTIVE": return "INACTIVE";
      default: return campaign.status || "NEW";
    }
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden select-none">
      {navOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <CampaignWorkspaceSidebar
        campaignName={campaign.name}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dashboardSubTab={dashboardSubTab}
        setDashboardSubTab={setDashboardSubTab}
        dashboardExpanded={dashboardExpanded}
        setDashboardExpanded={setDashboardExpanded}
        researchTab={researchTab}
        setResearchTab={setResearchTab}
        researchExpanded={researchExpanded}
        setResearchExpanded={setResearchExpanded}
        monitorSubTab={monitorTab}
        setMonitorSubTab={setMonitorTab}
        monitorExpanded={monitorExpanded}
        setMonitorExpanded={setMonitorExpanded}
        historySubTab={discoveryTab}
        setHistorySubTab={setDiscoveryTab}
        historyExpanded={historyExpanded}
        setHistoryExpanded={setHistoryExpanded}
        collapsed={campaignNavCollapsed}
        onToggleCollapse={() => setCampaignNavCollapsed((c) => !c)}
        lifecycleStatus={getDisplayStatus()}
        campaignStatus={campaign.status}
        navOpen={navOpen}
        onNavClose={() => setNavOpen(false)}
      />

      {/* Right content column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AppHeader crumbOverrides={{ [campaign.id]: campaign.name }} />

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
              <Button
                type="button"
                variant="brand"
                size="pill"
                onClick={() => setShowRefineModal(true)}
                className="shrink-0"
              >
                <Edit3 size={14} /> Refine Briefing
              </Button>
            </div>
          </div>
        )}

        <main className="flex-1 min-h-0 overflow-y-auto bg-surgical-bg">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <LeadLedger
                  campaign={campaign}
                  hideSidebar={true}
                  activeView={dashboardSubTab}
                  setActiveView={setDashboardSubTab}
                />
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
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Outreach</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Track replies and manage messages waiting for your approval</p>
                  </div>
                </div>

                {monitorTab === "monitor" ? (
                  (() => {
                    const MONITOR_PAGE_SIZE = 10;

                    // Build one row per active DM with its resolved friendly status up front,
                    // so filtering/pagination/badge rendering all share the same computed value.
                    const monitorRows = (campaign.dms || [])
                      .filter(dm => !["NEW", "SYNCED"].includes(dm.state || dm.status))
                      .map(dm => {
                        const co = campaign.target_companies.find(c => c.id === dm.target_company_id);
                        const dmStatus = dm.state || dm.status || "NEW";

                        const scheduledDraft = (campaign.drafts || []).find(
                          d => d.decision_maker_id === dm.id &&
                               d.status === "DRAFTED" &&
                               d.dispatch_state === "QUEUED" &&
                               d.scheduled_at
                        );
                        const hasScheduledDispatch = !!scheduledDraft;

                        // Pending (unsent, unscheduled) draft for this DM. dm.state often lags behind —
                        // the backend leaves it at the previous SENT stage while a new draft awaits
                        // approval — so a pending draft here takes priority over the raw dm state.
                        const pendingDraft = !hasScheduledDispatch && (campaign.drafts || []).find(
                          d => d.decision_maker_id === dm.id && d.status === "DRAFTED"
                        );

                        const status = getFriendlyStatus(
                          hasScheduledDispatch ? "DISPATCH_SCHEDULED" : pendingDraft ? "DRAFTED" : dmStatus,
                          pendingDraft || null
                        );

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

                        return { dm, co, status, hasScheduledDispatch, scheduledLabel };
                      });

                    // Unique status labels present, for the filter dropdown
                    const monitorStatusLabels = [...new Set(monitorRows.map(r => r.status.label))].sort();

                    const filteredRows = monitorStatusFilter
                      ? monitorRows.filter(r => r.status.label === monitorStatusFilter)
                      : monitorRows;

                    const totalMonitorPages = Math.ceil(filteredRows.length / MONITOR_PAGE_SIZE) || 1;
                    const safeMonitorPage = Math.min(monitorPage, totalMonitorPages);
                    const paginatedRows = filteredRows.slice(
                      (safeMonitorPage - 1) * MONITOR_PAGE_SIZE,
                      safeMonitorPage * MONITOR_PAGE_SIZE
                    );

                    return (
                      <div className="space-y-4">
                        {/* ── Header row: count + Filter ── */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-sm text-slate-500">
                            {filteredRows.length}
                            {monitorStatusFilter ? ` of ${monitorRows.length}` : ""} contact{filteredRows.length !== 1 ? "s" : ""}
                            {monitorStatusFilter && (
                              <span className="ml-2 text-indigo-600 font-medium">— {monitorStatusFilter}</span>
                            )}
                          </p>

                          <div className="relative" data-monitor-filter>
                            <button
                              onClick={() => setShowMonitorFilter(prev => !prev)}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                monitorStatusFilter
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <Filter size={13} />
                              {monitorStatusFilter || "Filter"}
                              <ChevronDown size={13} className={`transition-transform ${showMonitorFilter ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                              {showMonitorFilter && (
                                <motion.div
                                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 min-w-[220px]"
                                >
                                  <button
                                    onClick={() => { setMonitorStatusFilter(null); setMonitorPage(1); setShowMonitorFilter(false); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      !monitorStatusFilter ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    All statuses
                                    <span className="ml-auto text-xs opacity-60">{monitorRows.length}</span>
                                  </button>

                                  {monitorStatusLabels.map(label => {
                                    const count = monitorRows.filter(r => r.status.label === label).length;
                                    return (
                                      <button
                                        key={label}
                                        onClick={() => { setMonitorStatusFilter(label); setMonitorPage(1); setShowMonitorFilter(false); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                          monitorStatusFilter === label ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                      >
                                        {label}
                                        <span className="ml-auto text-xs opacity-60">{count}</span>
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100">
                                  <th className="px-6 py-3 text-xs font-medium text-slate-400">Contact</th>
                                  <th className="px-6 py-3 text-xs font-medium text-slate-400">Organization</th>
                                  <th className="px-6 py-3 text-xs font-medium text-slate-400">Status</th>
                                  <th className="px-6 py-3 text-xs font-medium text-slate-400 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {paginatedRows.length === 0 ? (
                                  <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                      <div className="flex flex-col items-center gap-3 text-slate-300">
                                        <Inbox size={36} strokeWidth={1.5} />
                                        <p className="text-sm text-slate-400">
                                          {monitorStatusFilter ? `No contacts with status "${monitorStatusFilter}".` : "No outreach activity yet."}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  paginatedRows.map(({ dm, co, status, hasScheduledDispatch, scheduledLabel }) => (
                                    <tr key={dm.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-xs shrink-0">
                                            {(dm.name || "P").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{dm.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{dm.position || "Decision Maker"}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-slate-500">{co?.name}</td>
                                      <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                          <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-xs font-medium border ${status.cls}`}>
                                            {status.label}
                                          </span>
                                          {hasScheduledDispatch && scheduledLabel && (
                                            <span className="text-xs text-slate-400">{scheduledLabel}</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center justify-end">
                                          <button
                                            onClick={() => setShowHistoryDM(dm)}
                                            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                                          >
                                            View History
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          {totalMonitorPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 select-none">
                              <span className="text-sm text-slate-500">
                                Page <span className="font-medium text-slate-700">{safeMonitorPage}</span> of {totalMonitorPages}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setMonitorPage(p => Math.max(p - 1, 1))}
                                  disabled={safeMonitorPage === 1}
                                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                  Previous
                                </button>
                                {getPageWindow(safeMonitorPage, totalMonitorPages).map((p, i) => (
                                  p === "..." ? (
                                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-slate-400">...</span>
                                  ) : (
                                    <button
                                      key={p}
                                      onClick={() => setMonitorPage(p)}
                                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${safeMonitorPage === p ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                                    >
                                      {p}
                                    </button>
                                  )
                                ))}
                                <button
                                  onClick={() => setMonitorPage(p => Math.min(p + 1, totalMonitorPages))}
                                  disabled={safeMonitorPage === totalMonitorPages}
                                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  (() => {
                    // All non-discovery pending drafts (includes already-scheduled ones so they stay visible)
                    const standardDrafts = (campaign.drafts || []).filter(
                      d => d.status === "DRAFTED" && d.draft_type !== "DISCOVERY"
                    );

                    // Helper: is this draft locked (already queued for scheduled send)?
                    const isDraftScheduled = (d) => d.dispatch_state === "QUEUED" && !!d.scheduled_at;

                    // Key/label per draft, derived from the draft itself (draft_type + followup_index)
                    // rather than dm.state — dm.state is left stale by the backend whenever a new
                    // follow-up draft is created (see getFriendlyStatus for details).
                    const draftFilterInfo = (d) => {
                      if (isDraftScheduled(d)) return { key: "DISPATCH_SCHEDULED", label: "Scheduled" };
                      const { label } = getFriendlyStatus("DRAFTED", d);
                      let key = "INITIAL_DRAFTED";
                      if (d.draft_type === "REMINDER") key = `REMINDER_${(d.followup_index || 0) - REMINDER_INDEX_BASE}_DRAFTED`;
                      else if (d.draft_type === "FOLLOWUP" || d.draft_type === "DISCOVERY") key = "DISCOVERY_DRAFTED";
                      return { key, label };
                    };

                    // Derive unique filter buckets present in this draft set, with their friendly labels
                    const filterLabels = new Map();
                    standardDrafts.forEach(d => {
                      const { key, label } = draftFilterInfo(d);
                      if (!filterLabels.has(key)) filterLabels.set(key, label);
                    });
                    const uniqueStates = [...filterLabels.keys()].sort();
                    const labelForFilter = (key) => filterLabels.get(key) || key;

                    // Apply active filter
                    const visibleDrafts = draftFilter
                      ? standardDrafts.filter(d => draftFilterInfo(d).key === draftFilter)
                      : standardDrafts;

                    return (
                      <div className="space-y-4">

                        {/* ── Header row: count + Filter + Dispatch All ── */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-sm text-slate-500">
                            {visibleDrafts.length}
                            {draftFilter ? ` of ${standardDrafts.length}` : ""} pending draft{visibleDrafts.length !== 1 ? "s" : ""}
                            {draftFilter && (
                              <span className="ml-2 text-indigo-600 font-medium">
                                — {labelForFilter(draftFilter)}
                              </span>
                            )}
                          </p>

                          <div className="flex items-center gap-2 relative">
                            {/* Filter button */}
                            <div className="relative" data-draft-filter>
                              <button
                                onClick={() => setShowDraftFilter(prev => !prev)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                  draftFilter
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                <Filter size={13} />
                                {draftFilter ? labelForFilter(draftFilter) : "Filter"}
                                <ChevronDown size={13} className={`transition-transform ${showDraftFilter ? "rotate-180" : ""}`} />
                              </button>

                              {/* Dropdown */}
                              <AnimatePresence>
                                {showDraftFilter && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 min-w-[220px]"
                                  >
                                    {/* All option */}
                                    <button
                                      onClick={() => { setDraftFilter(null); setShowDraftFilter(false); }}
                                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        !draftFilter
                                          ? "bg-slate-900 text-white"
                                          : "text-slate-600 hover:bg-slate-50"
                                      }`}
                                    >
                                      All statuses
                                      <span className="ml-auto text-xs opacity-60">{standardDrafts.length}</span>
                                    </button>

                                    {/* One chip per unique status */}
                                    {uniqueStates.map(state => {
                                      const count = standardDrafts.filter(d => draftFilterInfo(d).key === state).length;
                                      return (
                                        <button
                                          key={state}
                                          onClick={() => { setDraftFilter(state); setShowDraftFilter(false); }}
                                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            draftFilter === state
                                              ? "bg-slate-900 text-white"
                                              : "text-slate-600 hover:bg-slate-50"
                                          }`}
                                        >
                                          {labelForFilter(state)}
                                          <span className="ml-auto text-xs opacity-60">{count}</span>
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
                              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 active:scale-[0.98]"
                            >
                              {isDispatchingAll ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                              Send All
                            </button>
                          </div>
                        </div>

                        {/* ── Draft card grid ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {visibleDrafts.length === 0 ? (
                            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-16 text-center flex flex-col items-center gap-3">
                              <Mail size={40} className="text-slate-300" strokeWidth={1.5} />
                              <p className="text-sm text-slate-400">
                                {draftFilter
                                  ? `No drafts with status "${labelForFilter(draftFilter)}".`
                                  : "No pending drafts right now."}
                              </p>
                              {draftFilter && (
                                <button
                                  onClick={() => setDraftFilter(null)}
                                  className="text-sm text-indigo-600 hover:underline font-medium"
                                >
                                  Clear filter
                                </button>
                              )}
                            </div>
                          ) : (
                            visibleDrafts.map((draft) => {
                              const dm = campaign.dms?.find(d => d.id === draft.decision_maker_id);
                              const co = campaign.target_companies?.find(c => c.id === dm?.target_company_id);

                              // A draft is "locked" once it has been queued for scheduled dispatch
                              const isScheduled = draft.dispatch_state === "QUEUED" && !!draft.scheduled_at;

                              // Every card here is itself a pending DRAFTED draft, so use it directly
                              // rather than dm.state (which the backend leaves stale — see getFriendlyStatus).
                              const status = getFriendlyStatus(
                                isScheduled ? "DISPATCH_SCHEDULED" : "DRAFTED",
                                draft
                              );

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
                                  className="bg-white rounded-2xl border border-slate-200 p-5 transition-shadow hover:shadow-sm flex flex-col justify-between"
                                >
                                  <div className="space-y-3">
                                    {/* Card header: avatar + name, status badge on its own row */}
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-xs">
                                          {(dm?.name || "P").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium text-slate-900 truncate">{dm?.name}</p>
                                          <p className="text-xs text-slate-400 truncate">{co?.name}</p>
                                        </div>
                                      </div>

                                      <span className={`inline-flex w-fit max-w-full px-2 py-1 rounded-full text-xs font-medium border ${status.cls}`}>
                                        {status.label}
                                      </span>
                                    </div>

                                    {/* Scheduled time line */}
                                    {isScheduled && scheduledDisplay && (
                                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                                        <Clock size={12} className="text-blue-500 shrink-0" />
                                        <p className="text-xs text-blue-700 truncate">
                                          {scheduledDisplay}
                                        </p>
                                      </div>
                                    )}

                                    <div className="space-y-1.5">
                                      <p className="text-xs font-medium text-slate-400">Subject</p>
                                      <p className="text-sm text-slate-800 line-clamp-1">{draft.subject}</p>
                                      <p className="text-xs font-medium text-slate-400 mt-2">Message</p>
                                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                        {draft.body.replace(/<[^>]*>/g, '').slice(0, 150)}...
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 mt-5">
                                    <button
                                      onClick={() => {
                                        if (isScheduled) return;
                                        setDraftEditData({ subject: draft.subject, body: draft.body, email: dm?.email || "" });
                                        setSelectedDraft(draft);
                                      }}
                                      disabled={isScheduled}
                                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      <Edit3 size={13} /> Edit
                                    </button>
                                    <button
                                      onClick={() => { if (!isScheduled) handleSendMessage(draft.id, dm?.name, dm?.email); }}
                                      disabled={isScheduled || sendingId === draft.id}
                                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      {sendingId === draft.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                      {isScheduled ? "Queued" : "Send"}
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

            {activeTab === "history" && (() => {
              const discoveryDrafts = (campaign.drafts || []).filter(d => d.status === "DRAFTED" && d.draft_type === "DISCOVERY");
              const scheduledDMs = (campaign.dms || []).filter(dm => dm.status === "MEETING_BOOKED" || dm.scheduled_time_utc);

              return (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 max-w-[1600px] mx-auto space-y-6"
              >
                {discoveryTab === "drafts" ? (
                  <div className="space-y-4">
                    {/* ── Header row: title + count, matches the Scheduled meetings header ── */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">Drafts</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Discovery call emails ready for you to review and send.</p>
                      </div>
                      <Badge variant="secondary" className="tabular-nums">
                        {discoveryDrafts.length} pending draft{discoveryDrafts.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {/* ── Draft card grid — same markup as the Outreach > Drafts cards ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {discoveryDrafts.length === 0 ? (
                        <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-16 text-center flex flex-col items-center gap-3">
                          <PhoneCall size={40} className="text-slate-300" strokeWidth={1.5} />
                          <p className="text-sm text-slate-400">No pending drafts right now.</p>
                        </div>
                      ) : discoveryDrafts.map((draft) => {
                        const dm = campaign.dms?.find(d => d.id === draft.decision_maker_id);
                        const co = campaign.target_companies?.find(c => c.id === dm?.target_company_id);
                        const status = getFriendlyStatus("DRAFTED", draft);
                        return (
                          <motion.div
                            key={draft.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl border border-slate-200 p-5 transition-shadow hover:shadow-sm flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-xs">
                                    {(dm?.name || "P").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 truncate">{dm?.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{co?.name}</p>
                                  </div>
                                </div>

                                <span className={`inline-flex w-fit max-w-full px-2 py-1 rounded-full text-xs font-medium border ${status.cls}`}>
                                  {status.label}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <p className="text-xs font-medium text-slate-400">Subject</p>
                                <p className="text-sm text-slate-800 line-clamp-1">{draft.subject}</p>
                                <p className="text-xs font-medium text-slate-400 mt-2">Message</p>
                                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                  {draft.body.replace(/<[^>]*>/g, '').slice(0, 150)}...
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-5">
                              <button
                                onClick={() => {
                                  setDraftEditData({ subject: draft.subject, body: draft.body, email: dm?.email || "" });
                                  setSelectedDraft(draft);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Edit3 size={13} /> Edit
                              </button>
                              <button
                                onClick={() => handleSendMessage(draft.id, dm?.name, dm?.email)}
                                disabled={sendingId === draft.id}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {sendingId === draft.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                Send
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">Scheduled meetings</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Discovery calls your prospects have booked.</p>
                      </div>
                      <Badge variant="secondary" className="tabular-nums">{scheduledDMs.length} booked</Badge>
                    </div>

                    <Card>
                      {scheduledDMs.length === 0 ? (
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Calendar className="h-7 w-7 text-muted-foreground" />
                          </div>
                          <h3 className="text-base font-semibold mb-1">No meetings yet</h3>
                          <p className="text-sm text-muted-foreground max-w-sm">Booked discovery calls will show up here.</p>
                        </CardContent>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[28%]">Contact</TableHead>
                              <TableHead className="w-[22%]">Company</TableHead>
                              <TableHead className="w-[22%]">Meeting time</TableHead>
                              <TableHead className="w-[14%]">Time left</TableHead>
                              <TableHead className="w-[14%] text-right">Meeting link</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scheduledDMs.map(dm => {
                              const co = campaign.target_companies?.find(c => c.id === dm.target_company_id);
                              const meetingDate = formatMeetingDate(dm.scheduled_time_utc, dm.display_timezone);
                              const meetingTime = formatMeetingTime(dm.scheduled_time_utc, dm.display_timezone);
                              const isPast = dm.scheduled_time_utc && new Date(dm.scheduled_time_utc + "Z") < new Date();
                              return (
                                <TableRow key={dm.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                                        {(dm.name || "P").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{dm.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{dm.email}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm text-foreground">{co?.name || "Unknown"}</TableCell>
                                  <TableCell>
                                    {dm.scheduled_time_utc ? (
                                      <div className="flex flex-col">
                                        <span className={`text-sm ${isPast ? "text-muted-foreground" : "text-foreground"}`}>{meetingDate}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {meetingTime}{isPast && " · Elapsed"}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">TBD</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="gap-1.5">
                                      <Clock className="h-3 w-3" /> {formatTimeLeft(dm.scheduled_time_utc)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {dm.meeting_link ? (
                                      <Button asChild size="sm" variant="outline">
                                        <a href={dm.meeting_link} target="_blank" rel="noopener noreferrer">
                                          <Link2 className="h-4 w-4" /> Join
                                        </a>
                                      </Button>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">Not set yet</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </Card>
                  </>
                )}
              </motion.div>
              );
            })()}

          </AnimatePresence>
        </main>
      </div>

      {/* Company Intel Modal */}
      <CompanyDetailModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />

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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col border-l border-slate-200"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-900">History</h3>
                  <p className="text-sm text-slate-500 truncate">
                    {showHistoryDM.name} · {campaign.target_companies.find(c => c.id === showHistoryDM.target_company_id)?.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowHistoryDM(null)}
                  className="w-8 h-8 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6 relative">
                {/* Visual Connection Line */}
                <div className="absolute left-[33px] top-8 bottom-8 w-px bg-slate-100 z-0" />

                {getUnifiedHistory(showHistoryDM).map((event, idx) => {
                  const Icon = event.icon;
                  const isExpanded = expandedNodes.includes(event.type + idx);

                  return (
                    <div key={idx} className="relative flex gap-4 z-10">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${event.color}`}>
                        <Icon size={14} />
                      </div>

                      <div
                        onClick={() => toggleNodeExpansion(event.type + idx)}
                        className="bg-white p-4 rounded-xl border border-slate-200 flex-grow cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-xs text-slate-400 mb-1.5">
                          {event.label} · {formatTimeAgo(event.timestamp)}
                        </p>

                        <p className="text-sm font-medium text-slate-900 mb-1.5">
                          {event.type === "PROSPECT_IDENTIFIED"
                            ? `${event.title} (Score: ${event.content.score}/100)`
                            : `Subject: ${event.content.subject}`
                          }
                        </p>

                        <div className={`text-sm leading-relaxed text-slate-600 ${isExpanded ? '' : 'line-clamp-3'}`}>
                          {event.type === "PROSPECT_IDENTIFIED" ? (
                            <p>"{event.content.reason}"</p>
                          ) : (
                            <p className="whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">
                              {cleanEmailReply(event.content.body)}
                            </p>
                          )}
                        </div>

                        {event.type === "EMAIL_DRAFTED" && (
                          <div className="mt-3 flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              event.content.isApproved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {event.content.isApproved ? "Approved" : "Awaiting approval"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const dm = showHistoryDM;
                                const targetDraft = (campaign.drafts || []).find(
                                  d => String(d.decision_maker_id) === String(dm.id) && d.status === "DRAFTED"
                                );
                                if (targetDraft) {
                                  setDraftEditData({ subject: targetDraft.subject, body: targetDraft.body, email: dm.email || "" });
                                  setSelectedDraft(targetDraft);
                                }
                                setShowHistoryDM(null);
                              }}
                              className="text-sm font-medium text-indigo-600 hover:underline"
                            >
                              Go to draft →
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
                  <Button
                    type="button"
                    variant="brand-outline"
                    size="pill"
                    onClick={() => setShowRefineModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="brand"
                    size="pill"
                    onClick={handleRefineSubmit}
                    disabled={isSaving || Object.keys(refineAnswers).length === 0}
                    className="flex-[2]"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Synchronize Refinements
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispatch Confirmation Modal */}
      <DispatchConfirmModal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        recipientName={dispatchModalData.recipientName}
        recipientEmail={dispatchModalData.recipientEmail}
        scheduledTime={dispatchModalData.scheduledTime}
        onSchedule={() => handleDispatchConfirm("schedule")}
        onSendNow={() => handleDispatchConfirm("send-now")}
        isLoading={isConfirmingDispatch}
      />
    </div>
  );
};

export default CampaignWorkspace;
