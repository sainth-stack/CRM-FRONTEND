import { useState, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  Trash2,
  RefreshCw,
  Archive,
  Loader2,
  Square,
  CheckSquare,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";

const InactiveCampaigns = () => {
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
      const inactiveOnly = campaignsData.filter((c) => c.status === "INACTIVE");
      setCampaigns(inactiveOnly);
    } catch (error) {
      console.error("Error fetching inactive campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mission permanently?")) return;
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

  const handleRestore = async (id) => {
    setProcessingId(id);
    setProcessingAction("restore");
    try {
      await axios.patch(`${API_BASE_URL}/campaigns/${id}/status?status=PENDING`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    } catch (error) {
      console.error("Error restoring campaign:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} inactive missions?`)) return;
    setProcessingAction("batch-delete");
    try {
      await axios.post(`${API_BASE_URL}/campaigns/batch-delete`, { campaign_ids: selectedIds });
      setCampaigns((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Error in batch delete:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleBatchRestore = async () => {
    if (selectedIds.length === 0) return;
    setProcessingAction("batch-restore");
    try {
      await Promise.all(
        selectedIds.map((id) =>
          axios.patch(`${API_BASE_URL}/campaigns/${id}/status?status=PENDING`)
        )
      );
      setCampaigns((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Error in batch restore:", error);
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

  const allSelected = filteredCampaigns.length > 0 && selectedIds.length === filteredCampaigns.length;

  return (
    <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 min-h-screen select-none">
      {/* Ambient accent glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-10 w-[520px] h-[520px] bg-zinc-500/[0.04] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ===== Header ===== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <h1 className="text-3xl md:text-[34px] font-bold text-white tracking-tight leading-none">
                Inactive Campaigns
              </h1>
              {!isLoading && (
                <span className="px-2.5 py-1 rounded-full bg-zinc-700/40 border border-zinc-700/60 text-zinc-400 text-[11px] font-bold tabular-nums">
                  {campaigns.length}
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
              Manage paused, enqueued, or finished missions. Restore them to resume or purge for good.
            </p>
          </div>
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
              placeholder="Search archived missions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0f1c]/70 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-white outline-none focus:border-[#00f0ff] transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBatchRestore}
                disabled={processingAction !== null}
                className="flex-grow lg:flex-grow-0 flex items-center justify-center gap-2 px-4 py-3 bg-[#00f0ff]/10 text-[#7fe9f2] border border-[#00f0ff]/25 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#00f0ff]/20 transition-all disabled:opacity-50"
              >
                {processingAction === "batch-restore" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} strokeWidth={2.5} />
                )}
                {processingAction === "batch-restore" ? "Restoring…" : `Restore (${selectedIds.length})`}
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
              {processingAction === "batch-delete" ? "Purging…" : "Purge"}
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
                Scanning archives…
              </p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-zinc-800 bg-[#0a0f1c]/40 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-center">
                <Archive className="w-7 h-7 text-zinc-500" />
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight mb-1.5">
                  {searchQuery ? "No matching archives" : "Your archive is empty"}
                </p>
                <p className="text-zinc-500 font-medium text-sm max-w-sm mx-auto">
                  {searchQuery
                    ? "No archived campaigns match your search."
                    : "No paused or completed campaigns are currently stored."}
                </p>
              </div>
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
              const isSelected = selectedIds.includes(campaign.id);

              return (
                <div
                  key={campaign.id}
                  className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 p-4 sm:p-5 ${
                    isSelected
                      ? "border-[#00f0ff]/40 bg-[#00f0ff]/[0.04]"
                      : "border-zinc-800/80 bg-[#0a0f1c]/50 hover:border-zinc-700 hover:bg-[#0a0f1c]/70"
                  }`}
                >
                  {/* Hover accent rail */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-10 w-[3px] rounded-r-full bg-[#00f0ff] transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-40"
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

                    <div className="flex items-center gap-4 flex-grow min-w-0 opacity-75">
                      <div className="w-11 h-11 rounded-xl bg-zinc-800/50 border border-zinc-700/60 flex items-center justify-center shrink-0 font-bold text-zinc-400 text-xs">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-grow space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-zinc-300 tracking-tight truncate">
                            {campaign.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-zinc-700/40 text-zinc-400 border border-zinc-700/60">
                            Archived
                          </span>
                        </div>
                        <p className="text-zinc-600 font-medium text-xs truncate">
                          {[campaign.target_industry, campaign.target_location].filter(Boolean).join("  ·  ") ||
                            "Campaign setup validated"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <button
                      disabled={processingId === campaign.id}
                      onClick={() => handleRestore(campaign.id)}
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-[#00f0ff]/40 hover:text-[#7fe9f2] transition-all disabled:opacity-50"
                    >
                      {processingId === campaign.id && processingAction === "restore" ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RefreshCw size={13} strokeWidth={2.5} />
                      )}
                      {processingId === campaign.id && processingAction === "restore" ? "Restoring" : "Restore"}
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

export default InactiveCampaigns;
