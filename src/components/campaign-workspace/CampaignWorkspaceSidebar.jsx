import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Globe,
  Mail,
  PhoneCall,
  FileBarChart,
  Target,
  Users,
  Send,
  Trash,
  ArrowLeft,
  ChevronDown,
  Activity,
  Building2,
  Layers,
  BarChart2,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/AppLogo";
import { useAuth } from "@/context/AuthContext";

const navTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "research", label: "Campaign", icon: Globe },
  { id: "monitor", label: "Outreach", icon: Mail },
  { id: "history", label: "Calls & Meetings", icon: PhoneCall },
];

const dashboardSubTabs = [
  { id: "DASHBOARD", label: "Companies", icon: Building2 },
  { id: "PIPELINE", label: "Prospects", icon: Layers },
  { id: "ANALYSIS", label: "Analysis", icon: BarChart2 },
];

const researchSubTabs = [
  { id: "mission_briefing", label: "Briefing", icon: FileBarChart },
  { id: "lead_pipeline", label: "Targets", icon: Target },
  { id: "stakeholder_intel", label: "Contacts", icon: Users },
  { id: "outreach_protocol", label: "Drafts", icon: Send },
  { id: "rejected_artifacts", label: "Disqualified", icon: Trash },
];

const monitorSubTabs = [
  { id: "monitor", label: "Monitor", icon: Activity },
  { id: "drafts", label: "Drafts Outreach", icon: Mail },
];

const historySubTabs = [
  { id: "drafts", label: "Drafts", icon: PhoneCall },
  { id: "scheduled", label: "Scheduled Meetings", icon: Calendar },
];

// Pipeline gating for the "Campaign" (research) sub-routes. Each campaign moves
// through backend stages sequentially (see CampaignStatus in
// backend/app/db/models/campaign.py); a sub-route should only appear once the
// stage that produces its data has started, and should show a spinner only
// while that stage is the one actively running.
//
// milestone 0 = briefing in progress
// milestone 1 = briefing complete -> enrichment/ICP running (unlocks Targets + Disqualified)
// milestone 2 = enrichment/ICP complete -> stakeholder ranking running (unlocks Contacts)
// milestone 3 = stakeholder ranking complete -> drafting running (unlocks Drafts)
// milestone 4 = drafting complete (or terminal state)
const STAGE_MILESTONE = {
  PENDING: 0,
  INPUT_VALIDATED: 0,
  RESEARCHING_USER_COMPANY: 0,
  STAGE_1_CSV_TRIMMED: 0,
  INTERVENTION_NEEDED: 0,
  STAGE_2_USER_INTEL_COMPLETE: 1,
  STAGE_3_ICP_FILTERED: 1,
  STAGE_4_RESEARCH_COMPLETE: 2,
  STAGE_5_STAKEHOLDERS_RANKED: 3,
  STAGE_6_DRAFTING_COMPLETE: 4,
  COMPLETED: 4,
  PARTIAL_SUCCESS: 4,
  FAILED: 4,
  INACTIVE: 4,
};

// Statuses where the pipeline isn't actively advancing (blocked, finished, or
// errored) — a sub-route can still be unlocked at these statuses, but it
// should never show a spinner since nothing is currently "in progress".
const STALLED_STATUSES = new Set([
  "INTERVENTION_NEEDED",
  "FAILED",
  "INACTIVE",
  "COMPLETED",
  "PARTIAL_SUCCESS",
]);

const RESEARCH_TAB_GATING = {
  mission_briefing: { unlockAt: 0, spinUntil: 1 },
  lead_pipeline: { unlockAt: 1, spinUntil: 2 },
  stakeholder_intel: { unlockAt: 2, spinUntil: 3 },
  outreach_protocol: { unlockAt: 3, spinUntil: 4 },
  rejected_artifacts: { unlockAt: 1, spinUntil: null }, // unlocks with Targets; never spins on its own
};

function SpinningIcon({ className, ...rest }) {
  return <Loader2 className={cn(className, "animate-spin")} {...rest} />;
}

function getVisibleResearchSubTabs(campaignStatus) {
  const milestone = STAGE_MILESTONE[campaignStatus] ?? 4; // unknown/legacy status -> fail open, show everything
  const isProcessing = !STALLED_STATUSES.has(campaignStatus);

  return researchSubTabs
    .filter((sub) => milestone >= RESEARCH_TAB_GATING[sub.id].unlockAt)
    .map((sub) => {
      const gate = RESEARCH_TAB_GATING[sub.id];
      const isLoading =
        isProcessing &&
        gate.spinUntil != null &&
        milestone >= gate.unlockAt &&
        milestone < gate.spinUntil;
      return isLoading ? { ...sub, icon: SpinningIcon } : sub;
    });
}

const navItemClass = (active) =>
  cn(
    "group relative flex w-full items-center gap-3 rounded-xl text-[13px] font-semibold transition-all duration-200",
    active ? "bg-[#00f0ff]/10 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
  );

const navItemStyle = { padding: "10px 12px" };

const activeBarClass = (active) =>
  cn(
    "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#00f0ff] transition-all duration-200",
    active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
  );

const iconClass = (active) =>
  cn(
    "h-[18px] w-[18px] shrink-0 transition-colors",
    active ? "text-[#00f0ff]" : "text-zinc-500 group-hover:text-zinc-300"
  );

export function CampaignWorkspaceSidebar({
  campaignName,
  activeTab,
  setActiveTab,
  dashboardSubTab,
  setDashboardSubTab,
  dashboardExpanded,
  setDashboardExpanded,
  researchTab,
  setResearchTab,
  researchExpanded,
  setResearchExpanded,
  monitorSubTab,
  setMonitorSubTab,
  monitorExpanded,
  setMonitorExpanded,
  historySubTab,
  setHistorySubTab,
  historyExpanded,
  setHistoryExpanded,
  collapsed,
  onToggleCollapse,
  lifecycleStatus,
  campaignStatus,
  navOpen,
  onNavClose,
}) {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.email?.split("@")[0] || "Guest";
  const initials = displayName.slice(0, 2).toUpperCase();

  const expandableConfig = {
    dashboard: {
      subTabs: dashboardSubTabs,
      subTab: dashboardSubTab,
      setSubTab: setDashboardSubTab,
      expanded: dashboardExpanded,
      setExpanded: setDashboardExpanded,
    },
    research: {
      subTabs: getVisibleResearchSubTabs(campaignStatus),
      subTab: researchTab,
      setSubTab: setResearchTab,
      expanded: researchExpanded,
      setExpanded: setResearchExpanded,
    },
    monitor: {
      subTabs: monitorSubTabs,
      subTab: monitorSubTab,
      setSubTab: setMonitorSubTab,
      expanded: monitorExpanded,
      setExpanded: setMonitorExpanded,
    },
    history: {
      subTabs: historySubTabs,
      subTab: historySubTab,
      setSubTab: setHistorySubTab,
      expanded: historyExpanded,
      setExpanded: setHistoryExpanded,
    },
  };

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    onNavClose?.();
  };

  const handleSubTabSelect = (tabId, subId, cfg) => {
    setActiveTab(tabId);
    cfg.setExpanded(true);
    cfg.setSubTab(subId);
    onNavClose?.();
  };

  const toggleExpand = (e, tabId, cfg) => {
    e.stopPropagation();
    if (activeTab === tabId && cfg.expanded) {
      cfg.setExpanded(false);
    } else {
      setActiveTab(tabId);
      cfg.setExpanded(true);
    }
    onNavClose?.();
  };

  return (
    <aside
      className={cn(
        "fixed md:static inset-y-0 left-0 z-40 flex h-full flex-col border-r border-zinc-900/70 transition-all duration-200 md:translate-x-0",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded",
        navOpen ? "translate-x-0" : "-translate-x-full"
      )}
      style={{ background: "#060a14" }}
    >
      {/* Header — matches AppSidebar */}
      <div
        className={cn(
          "relative flex shrink-0 items-center border-b border-zinc-900/70 group",
          collapsed ? "justify-center px-2 h-16" : "justify-between px-4 h-16"
        )}
      >
        <AppLogo
          collapsed={collapsed}
          showTagline={!collapsed}
          size="sm"
          className={cn(
            "transition-all duration-200",
            collapsed && "group-hover:opacity-0 group-hover:scale-75 group-hover:pointer-events-none"
          )}
        />
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            "rounded-lg p-1.5 text-zinc-500 transition-all duration-200 hover:bg-zinc-800/60 hover:text-white hidden md:inline-flex",
            collapsed
              ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
              : "shrink-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onNavClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 transition-all duration-200 hover:bg-zinc-800/60 hover:text-white md:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* User profile — matches AppSidebar */}
      <div
        className={cn(
          "shrink-0 border-b border-zinc-900/70 px-3 py-3",
          collapsed ? "flex justify-center" : "flex items-center gap-3"
        )}
      >
        <div className="relative h-9 w-9 shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-zinc-950"
            style={{ background: "#00f0ff" }}
          >
            {initials}
          </div>
          <div
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 bg-emerald-500"
            style={{ borderColor: "#060a14" }}
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-white">{displayName}</p>
            <p className="truncate text-[11px] text-zinc-500">{user?.role || ""}</p>
          </div>
        )}
      </div>

      {/* Back link — mirrors admin "Back to Home" */}
      <div className={cn("shrink-0 px-2 pt-3 pb-1", collapsed && "flex justify-center")}>
        <Link
          to="/active"
          title="All campaigns"
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-400 transition-colors hover:bg-zinc-800/40 hover:text-white",
            collapsed && "w-auto justify-center px-2"
          )}
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          {!collapsed && <span>All campaigns</span>}
        </Link>
      </div>

      {/* Campaign context label */}
      {!collapsed && (
        <div className="shrink-0 px-5 pb-1 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Campaign</p>
          <p className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-white" title={campaignName}>
            {campaignName || "Untitled campaign"}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto px-2 py-3 no-scrollbar">
        {navTabs.map((t) => {
          const active = activeTab === t.id;
          const cfg = expandableConfig[t.id];

          if (cfg) {
            return (
              <div key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(t.id);
                    cfg.setExpanded(true);
                    onNavClose?.();
                  }}
                  className={navItemClass(active)}
                  style={navItemStyle}
                  title={collapsed ? t.label : undefined}
                >
                  <span className={activeBarClass(active)} />
                  <t.icon className={iconClass(active)} />
                  {!collapsed && <span className="flex-1 text-left">{t.label}</span>}
                  {!collapsed && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => toggleExpand(e, t.id, cfg)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleExpand(e, t.id, cfg);
                        }
                      }}
                      className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
                      aria-label={cfg.expanded ? "Collapse sections" : "Expand sections"}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-300 ease-out",
                          active && cfg.expanded
                            ? "rotate-0 text-[#00f0ff]"
                            : "-rotate-90 text-zinc-500 group-hover:text-zinc-300"
                        )}
                      />
                    </span>
                  )}
                </button>

                {!collapsed && (
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                      active && cfg.expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-4 mt-1 space-y-0.5 border-l border-zinc-800/70 pl-2 pb-1">
                        {cfg.subTabs.map((sub) => {
                          const subActive = cfg.subTab === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleSubTabSelect(t.id, sub.id, cfg)}
                              className={navItemClass(subActive)}
                              style={{ padding: "8px 12px" }}
                            >
                              <span className={activeBarClass(subActive)} />
                              <sub.icon className={iconClass(subActive)} />
                              <span>{sub.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabSelect(t.id)}
              className={navItemClass(active)}
              style={navItemStyle}
              title={collapsed ? t.label : undefined}
            >
              <span className={activeBarClass(active)} />
              <t.icon className={iconClass(active)} />
              {!collapsed && <span>{t.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer — lifecycle status */}
      <div className="mt-auto shrink-0 border-t border-zinc-900/70">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            collapsed ? "justify-center px-2" : ""
          )}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#00f0ff]/20 bg-[#00f0ff]/10 text-[#00f0ff]"
            title={lifecycleStatus}
          >
            <Activity className="h-4 w-4" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Lifecycle</p>
              <p className="truncate text-[12px] font-semibold text-[#00f0ff]">{lifecycleStatus}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
