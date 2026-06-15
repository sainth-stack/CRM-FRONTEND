import { useState, useEffect } from "react";
import { Trash2, RefreshCw, Archive, Loader2 } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "@/config";
import { Button } from "@/components/ui/button";
import {
  CampaignPageHeader,
  CampaignToolbar,
  SelectAllRow,
  CampaignEmptyState,
  CampaignLoadingState,
  CampaignRow,
} from "@/components/campaigns/CampaignShared";

const InactiveCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/campaigns`);
      const campaignsData = response.data.campaigns || [];
      setCampaigns(campaignsData.filter((c) => c.status === "INACTIVE"));
    } catch (error) {
      console.error("Error fetching inactive campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campaign permanently?")) return;
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
    if (!window.confirm(`Permanently delete ${selectedIds.length} inactive campaigns?`)) return;
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
        selectedIds.map((id) => axios.patch(`${API_BASE_URL}/campaigns/${id}/status?status=PENDING`))
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
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
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
    <div className="space-y-6">
      <CampaignPageHeader
        title="Inactive Campaigns"
        count={!isLoading ? campaigns.length : undefined}
        description="Manage paused, enqueued, or finished missions. Restore them to resume or purge for good."
      />

      <CampaignToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search archived campaigns…"
        sortOrder={sortOrder}
        onToggleSort={() => setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))}
        selectedCount={selectedIds.length}
        batchActions={
          selectedIds.length > 0 ? (
            <Button variant="outline" size="sm" disabled={processingAction !== null} onClick={handleBatchRestore}>
              {processingAction === "batch-restore" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Restore ({selectedIds.length})
            </Button>
          ) : null
        }
        primaryActionLabel={processingAction === "batch-delete" ? "Purging…" : "Purge"}
        primaryActionIcon={Trash2}
        onPrimaryAction={handleBatchDelete}
        primaryDisabled={selectedIds.length === 0 || processingAction !== null}
        primaryLoading={processingAction === "batch-delete"}
      />

      {filteredCampaigns.length > 0 && (
        <SelectAllRow
          allSelected={allSelected}
          selectedCount={selectedIds.length}
          onToggle={() => setSelectedIds(allSelected ? [] : filteredCampaigns.map((c) => c.id))}
          disabled={processingAction !== null}
        />
      )}

      {isLoading ? (
        <CampaignLoadingState message="Loading archived campaigns…" />
      ) : filteredCampaigns.length === 0 ? (
        <CampaignEmptyState
          icon={Archive}
          title={searchQuery ? "No matching archives" : "Your archive is empty"}
          description={
            searchQuery
              ? "No archived campaigns match your search."
              : "No paused or completed campaigns are currently stored."
          }
          showAction={false}
        />
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              isSelected={selectedIds.includes(campaign.id)}
              onToggleSelect={() => toggleSelect(campaign.id)}
              onRestore={handleRestore}
              onDelete={handleDelete}
              processingId={processingId}
              processingAction={processingAction}
              mode="inactive"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InactiveCampaigns;
