import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ArrowUpDown,
  Trash2,
  Power,
  Target,
  CheckCircle2,
  Loader2,
  Square,
  CheckSquare,
  Layers,
  Activity,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";

const ActiveCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/campaigns`);
      const campaignsData = response.data.campaigns || [];
      const activeOnly = campaignsData.filter((c) => c.status !== "INACTIVE");
      setCampaigns(activeOnly);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign permanently?")) return;
    setProcessingId(id);
    setProcessingAction("delete");
    try {
      await axios.delete(`${API_BASE_URL}/campaigns/${id}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    } catch (error) {
      console.error("Error deleting campaign:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleDeactivate = async (id) => {
    setProcessingId(id);
    setProcessingAction("deactivate");
    try {
      await axios.patch(`${API_BASE_URL}/campaigns/${id}/status?status=INACTIVE`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    } catch (error) {
      console.error("Error deactivating campaign:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} campaigns permanently?`)) return;

    setProcessingAction("batch-delete");
    try {
      await axios.post(`${API_BASE_URL}/campaigns/batch-delete`, {
        campaign_ids: selectedIds,
      });
      setCampaigns((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Error in batch delete:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleBatchDeactivate = async () => {
    if (selectedIds.length === 0) return;
    setProcessingAction("batch-deactivate");
    try {
      await Promise.all(
        selectedIds.map((id) =>
          axios.patch(`${API_BASE_URL}/campaigns/${id}/status?status=INACTIVE`)
        )
      );
      setCampaigns((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Error in batch deactivate:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCampaigns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCampaigns.map((c) => c.id));
    }
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };

  const filteredCampaigns = campaigns
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.target_industry || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.target_location || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  // Dark-theme status pill: translucent fill + colored text + matching border.
  const getStatusColor = (status) => {
    const s = String(status).toUpperCase();
    if (s === "COMPLETED" || s.includes("STAGE_6")) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
    if (s.includes("STAGE_5")) return "bg-indigo-500/10 border-indigo-500/20 text-indigo-300";
    if (s.includes("STAGE_4")) return "bg-blue-500/10 border-blue-500/20 text-blue-300";
    if (s.includes("STAGE_3")) return "bg-violet-500/10 border-violet-500/20 text-violet-300";
    if (s.includes("STAGE_2")) return "bg-[#00f0ff]/10 border-[#00f0ff]/25 text-[#7fe9f2]";
    if (s.includes("STAGE_1")) return "bg-amber-500/10 border-amber-500/20 text-amber-300";
    if (s === "FAILED" || s === "ERROR") return "bg-rose-500/10 border-rose-500/20 text-rose-300";
    return "bg-zinc-700/30 border-zinc-700/50 text-zinc-400";
  };

  // Human-readable label from the raw pipeline status enum.
  const formatStatus = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "COMPLETED") return "Completed";
    if (s === "PENDING") return "Queued";
    if (s === "INPUT_VALIDATED") return "Validated";
    if (s === "FAILED" || s === "ERROR") return "Failed";
    const m = s.match(/^STAGE_\d+_?(.*)$/);
    const raw = m ? m[1] : s;
    const label = raw
      .toLowerCase()
      .split("_")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return label || "Processing";
  };

  const getStageProgress = (status) => {
    const s = String(status).toUpperCase();
    if (s === "PENDING") return 5;
    if (s === "INPUT_VALIDATED") return 15;
    if (s.includes("STAGE_1")) return 30;
    if (s.includes("STAGE_2")) return 45;
    if (s.includes("STAGE_3")) return 60;
    if (s.includes("STAGE_4")) return 75;
    if (s.includes("STAGE_5")) return 90;
    if (s.includes("STAGE_6") || s === "COMPLETED") return 100;
    return 0;
  };

  const totalCount = campaigns.length;
  const completedCount = campaigns.filter((c) => getStageProgress(c.status) === 100).length;
  const inProgressCount = totalCount - completedCount;
  const allSelected = filteredCampaigns.length > 0 && selectedIds.length === filteredCampaigns.length;

  return (
    <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 min-h-screen select-none">
      {/* Ambient accent glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-10 w-[520px] h-[520px] bg-[#00f0ff]/[0.05] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ===== Header ===== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <h1 className="text-3xl md:text-[34px] font-bold text-white tracking-tight leading-none">
                Active Campaigns
              </h1>
              {!isLoading && (
                <span className="px-2.5 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/25 text-[#7fe9f2] text-[11px] font-bold tabular-nums">
                  {totalCount}
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
              Monitor, manage, and audit your high-intent pipeline outreach.
            </p>
          </div>

          <Link
            to="/create"
            className="group inline-flex items-center gap-2 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_0_24px_rgba(0,240,255,0.22)] hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap self-start md:self-auto"
          >
            <Plus size={16} strokeWidth={3} />
            Launch Campaign
          </Link>
        </div>

        {/* ===== Stats row ===== */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[
            { label: "Total", value: totalCount, icon: Layers, tint: "text-zinc-300" },
            { label: "In Progress", value: inProgressCount, icon: Activity, tint: "text-[#7fe9f2]" },
            { label: "Completed", value: completedCount, icon: CheckCircle2, tint: "text-emerald-300" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-zinc-800/80 bg-[#0a0f1c]/60 backdrop-blur-sm px-4 sm:px-5 py-4 flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center shrink-0">
                <stat.icon size={17} className={stat.tint} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white tabular-nums leading-none">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1.5 truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Toolbar ===== */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-6 w-full">
          <div className="relative flex-grow group w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#00f0ff] transition-colors"
              size={17}
            />
            <input
              type="text"
              placeholder="Filter by name, industry, or location…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0f1c]/70 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-white outline-none focus:border-[#00f0ff] transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBatchDeactivate}
                disabled={processingAction !== null}
                className="flex-grow lg:flex-grow-0 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 text-amber-300 border border-amber-500/25 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-amber-500/20 transition-all disabled:opacity-50"
              >
                {processingAction === "batch-deactivate" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Power size={15} strokeWidth={2.5} />
                )}
                {processingAction === "batch-deactivate" ? "Halting…" : `Deactivate (${selectedIds.length})`}
              </button>
            )}

            <button
              disabled={selectedIds.length === 0 || processingAction !== null}
              onClick={handleBatchDelete}
              className={`flex-grow lg:flex-grow-0 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                selectedIds.length > 0
                  ? "bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20"
                  : "bg-zinc-900/40 border border-zinc-800/60 text-zinc-600 cursor-not-allowed"
              } disabled:opacity-50`}
            >
              {processingAction === "batch-delete" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} strokeWidth={2.5} />
              )}
              {processingAction === "batch-delete" ? "Deleting…" : "Delete"}
            </button>

            <button
              onClick={toggleSort}
              className="flex-grow lg:flex-grow-0 flex items-center justify-center gap-2 px-4 py-3 bg-[#0a0f1c]/60 border border-zinc-800 rounded-xl text-zinc-300 font-bold text-[11px] uppercase tracking-widest hover:border-zinc-600 hover:text-white transition-all"
            >
              <ArrowUpDown size={15} />
              {sortOrder === "newest" ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        {/* ===== Select-all row ===== */}
        {filteredCampaigns.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-4 px-1">
            <button
              onClick={toggleSelectAll}
              disabled={processingAction !== null}
              className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-[#00f0ff] transition-colors disabled:opacity-50"
            >
              {allSelected ? (
                <CheckSquare size={15} className="text-[#00f0ff]" strokeWidth={2.5} />
              ) : (
                <Square size={15} className="text-zinc-600" strokeWidth={2.5} />
              )}
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            {selectedIds.length > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {selectedIds.length} selected
              </span>
            )}
          </div>
        )}

        {/* ===== List ===== */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-28 rounded-2xl border border-zinc-800/80 bg-[#0a0f1c]/50 gap-3">
              <Loader2 className="w-9 h-9 text-[#00f0ff] animate-spin" />
              <p className="text-zinc-500 font-bold uppercase text-[11px] tracking-widest">
                Syncing campaign data…
              </p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-zinc-800 bg-[#0a0f1c]/40 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#00f0ff]/[0.06] border border-[#00f0ff]/15 flex items-center justify-center">
                <Target className="w-7 h-7 text-[#00f0ff]/70" />
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight mb-1.5">
                  {searchQuery ? "No matching campaigns" : "No active campaigns yet"}
                </p>
                <p className="text-zinc-500 font-medium text-sm max-w-sm mx-auto">
                  {searchQuery
                    ? "No campaigns match your current search or filters."
                    : "Launch your first campaign to start researching and reaching prospects."}
                </p>
              </div>
              {!searchQuery && (
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_24px_rgba(0,240,255,0.22)] mt-1"
                >
                  <Plus size={15} strokeWidth={3} />
                  Launch Campaign
                </Link>
              )}
            </div>
          ) : (
            filteredCampaigns.map((campaign) => {
              const initials = (campaign.name || "C")
                .split(" ")
                .filter(Boolean)
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const progress = getStageProgress(campaign.status);
              const isSelected = selectedIds.includes(campaign.id);

              return (
                <div
                  key={campaign.id}
                  className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 p-4 sm:p-5 ${
                    isSelected
                      ? "border-[#00f0ff]/40 bg-[#00f0ff]/[0.04]"
                      : "border-zinc-800/80 bg-[#0a0f1c]/60 hover:border-zinc-700 hover:bg-[#0a0f1c]/80"
                  }`}
                >
                  {/* Hover accent rail */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-10 w-[3px] rounded-r-full bg-[#00f0ff] transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                    }`}
                  />

                  {/* Left: checkbox + info */}
                  <div className="flex items-center gap-4 flex-grow min-w-0">
                    <button
                      onClick={() => toggleSelect(campaign.id)}
                      aria-label={isSelected ? "Deselect campaign" : "Select campaign"}
                      className={`flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#00f0ff] border-[#00f0ff] text-zinc-950"
                          : "bg-zinc-900/60 border-zinc-700 text-transparent hover:border-[#00f0ff]/50"
                      }`}
                    >
                      <CheckCircle2 size={14} strokeWidth={3} />
                    </button>

                    <Link
                      to={`/campaign/${campaign.id}`}
                      className="flex items-center gap-4 group/info flex-grow min-w-0"
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs bg-gradient-to-br from-[#00f0ff]/20 to-cyan-600/[0.08] border border-[#00f0ff]/20 text-[#7fe9f2] transition-transform group-hover/info:scale-105">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-grow space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate group-hover/info:text-[#00f0ff] transition-colors">
                            {campaign.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(
                              campaign.status
                            )}`}
                          >
                            {formatStatus(campaign.status)}
                          </span>
                        </div>
                        <p className="text-zinc-500 font-medium text-xs truncate">
                          {[campaign.target_industry, campaign.target_location].filter(Boolean).join("  ·  ") ||
                            "Campaign setup validated"}
                        </p>

                        {/* Progress */}
                        <div className="w-full max-w-md space-y-1.5 pt-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.12em]">
                              Intelligence Pipeline
                            </span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest tabular-nums">
                              {progress}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                progress === 100 ? "bg-emerald-400" : "bg-[#00f0ff]"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <button
                      disabled={processingId === campaign.id}
                      onClick={() => handleDeactivate(campaign.id)}
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-amber-500/40 hover:text-amber-300 transition-all disabled:opacity-50"
                    >
                      {processingId === campaign.id && processingAction === "deactivate" ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Power size={13} strokeWidth={2.5} />
                      )}
                      {processingId === campaign.id && processingAction === "deactivate" ? "Halting" : "Deactivate"}
                    </button>

                    <button
                      disabled={processingId === campaign.id}
                      onClick={() => handleDelete(campaign.id)}
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500/20 transition-all disabled:opacity-50"
                    >
                      {processingId === campaign.id && processingAction === "delete" ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} strokeWidth={2.5} />
                      )}
                      {processingId === campaign.id && processingAction === "delete" ? "Deleting" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveCampaigns;
