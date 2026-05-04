import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, ArrowUpDown, 
  Trash2, RefreshCw, Archive, 
  Loader2, Square, CheckSquare,
  CheckCircle2
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
      const inactiveOnly = campaignsData.filter(c => c.status === "INACTIVE");
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
    setProcessingAction('delete');
    try {
      await axios.delete(`${API_BASE_URL}/campaigns/${id}`);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error("Error deleting campaign:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleRestore = async (id) => {
    setProcessingId(id);
    setProcessingAction('restore');
    try {
      await axios.patch(`${API_BASE_URL}/campaigns/${id}/status?status=PENDING`);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
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
    setProcessingAction('batch-delete');
    try {
      await axios.post(`${API_BASE_URL}/campaigns/batch-delete`, { campaign_ids: selectedIds });
      setCampaigns(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Error in batch delete:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleBatchRestore = async () => {
    if (selectedIds.length === 0) return;
    setProcessingAction('batch-restore');
    try {
      await Promise.all(selectedIds.map(id => 
        axios.patch(`${API_BASE_URL}/campaigns/${id}/status?status=PENDING`)
      ));
      setCampaigns(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Error in batch restore:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCampaigns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCampaigns.map(c => c.id));
    }
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };

  const filteredCampaigns = campaigns
    .filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.query.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 min-h-screen font-sans bg-slate-50/20 select-none">
      {/* Top Header & Context Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight uppercase italic leading-tight select-none">
            Inactive Campaigns
          </h1>
          <p className="text-slate-400 font-bold text-sm tracking-wide max-w-xl leading-relaxed select-none">
            Manage paused, enqueued, or finished missions.
          </p>
        </div>
      </div>

      {/* Operation Dashboard Block */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8 w-full">
        <div className="relative flex-grow group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search archived missions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100/80 rounded-2xl pl-12 pr-6 py-3.5 text-slate-800 font-extrabold outline-none focus:border-red-500/30 focus:shadow-sm transition-all placeholder:text-slate-300 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBatchRestore}
              disabled={processingAction !== null}
              className="flex-grow lg:flex-grow-0 flex items-center justify-center gap-2 px-5 py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
            >
              {processingAction === 'batch-restore' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} strokeWidth={3} />}
              {processingAction === 'batch-restore' ? "Restoring" : "Restore Selected"}
            </button>
          )}
          <button 
            disabled={selectedIds.length === 0 || processingAction !== null}
            onClick={handleBatchDelete}
            className={`flex-grow lg:flex-grow-0 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
                selectedIds.length > 0 
                ? "bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white" 
                : "bg-slate-50 border border-slate-100/60 text-slate-300 cursor-not-allowed opacity-40"
            } disabled:opacity-50`}
          >
            {processingAction === 'batch-delete' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={3} />}
            {processingAction === 'batch-delete' ? "Deleting" : "Batch Purge"}
          </button>
          <button 
            onClick={toggleSort}
            className="flex-grow lg:flex-grow-0 flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-slate-50/40 transition-all shadow-sm"
          >
            <ArrowUpDown size={16} />
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      {/* Context Action Menu Bar */}
      {filteredCampaigns.length > 0 && (
        <div className="flex items-center gap-3 mb-6 px-2 select-none">
          <button 
            onClick={toggleSelectAll}
            disabled={processingAction !== null}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 select-none"
          >
            {selectedIds.length === filteredCampaigns.length ? (
              <CheckSquare size={16} className="text-red-600" strokeWidth={3} />
            ) : (
              <Square size={16} className="text-slate-300" strokeWidth={3} />
            )}
            {selectedIds.length === filteredCampaigns.length ? "Deselect All" : "Select All Campaigns"}
          </button>
        </div>
      )}

      {/* Main Campaign List Content */}
      <div className="flex flex-col gap-5 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white border border-slate-100/80 rounded-3xl gap-3 shadow-sm select-none">
             <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
             <p className="text-slate-400 font-extrabold uppercase text-xs tracking-widest animate-pulse">Scanning Archives...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white border border-slate-100/80 rounded-[32px] border-dashed gap-4 text-center select-none shadow-sm">
             <Archive className="w-14 h-14 text-red-200 animate-pulse" />
             <div>
                <p className="text-slate-700 font-extrabold uppercase tracking-wide text-sm leading-tight mb-1">
                  Your archive is empty
                </p>
                <p className="text-slate-400 font-bold text-xs tracking-wide max-w-sm mx-auto">
                  No paused or completed campaigns are currently stored.
                </p>
             </div>
          </div>
        ) : (
          filteredCampaigns.map((campaign, index) => {
            const initials = (campaign.name || "C")
              .split(" ")
              .filter(Boolean)
              .map(w => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div 
                key={campaign.id}
                className={`bg-white border rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 select-none ${
                  selectedIds.includes(campaign.id) ? "border-red-200 bg-red-50/10" : "border-slate-100/80"
                }`}
              >
                <div className="flex items-center gap-5 flex-grow">
                  <button 
                    onClick={() => toggleSelect(campaign.id)}
                    className={`flex-shrink-0 w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                        selectedIds.includes(campaign.id) 
                        ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-500/10 hover:bg-red-700" 
                        : "bg-slate-50 border-slate-200 text-transparent hover:border-red-400/50"
                    }`}
                  >
                    <CheckCircle2 size={15} strokeWidth={3} />
                  </button>

                  <div className="flex gap-5 flex-grow opacity-80 select-text">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm shrink-0 font-extrabold text-slate-400 text-xs select-none">
                      {initials}
                    </div>
                    <div className="space-y-1 pt-1 flex-grow">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-lg md:text-xl font-extrabold text-slate-400 tracking-tight uppercase italic leading-tight">
                          {campaign.name}
                        </h3>
                        <span className="px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 border border-slate-200">
                          ARCHIVED
                        </span>
                      </div>
                      <p className="text-slate-300 font-bold text-xs line-clamp-1 max-w-4xl lowercase italic select-none">
                        {campaign.query}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 select-none">
                  <button 
                    disabled={processingId === campaign.id}
                    onClick={() => handleRestore(campaign.id)}
                    className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100/80 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all select-none shadow-sm disabled:opacity-50"
                  >
                    {processingId === campaign.id && processingAction === 'restore' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} strokeWidth={3} />}
                    {processingId === campaign.id && processingAction === 'restore' ? "Restoring" : "Restore"}
                  </button>
                  <button 
                    disabled={processingId === campaign.id}
                    onClick={() => handleDelete(campaign.id)}
                    className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all select-none shadow-sm disabled:opacity-50"
                  >
                    {processingId === campaign.id && processingAction === 'delete' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} strokeWidth={3} />}
                    {processingId === campaign.id && processingAction === 'delete' ? "Deleting" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InactiveCampaigns;
