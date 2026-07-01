import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Power, Target, CheckCircle2, Layers, Activity, Loader2 } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "@/config";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/context/ToastContext";
import {
  CampaignPageHeader,
  CampaignStats,
  CampaignToolbar,
  SelectAllRow,
  CampaignEmptyState,
  CampaignLoadingState,
  CampaignRow,
  getStageProgress,
} from "@/components/campaigns/CampaignShared";

const ActiveCampaigns = () => {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [confirmState, setConfirmState] = useState(null); // { type: "single" | "batch", id? }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/campaigns`);
      const campaignsData = response.data.campaigns || [];
      setCampaigns(campaignsData.filter((c) => c.status !== "INACTIVE"));
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestDelete = (id) => setConfirmState({ type: "single", id });
  const requestBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmState({ type: "batch" });
  };

  const handleDelete = async (id) => {
    setProcessingId(id);
    setProcessingAction("delete");
    try {
      await axios.delete(`${API_BASE_URL}/campaigns/${id}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      showToast({ tone: "success", title: "Campaign deleted" });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      showToast({ tone: "error", title: "Delete failed", description: error?.response?.data?.detail || "Please try again." });
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
      showToast({ tone: "success", title: "Campaign deactivated" });
    } catch (error) {
      console.error("Error deactivating campaign:", error);
      showToast({ tone: "error", title: "Deactivate failed", description: error?.response?.data?.detail || "Please try again." });
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    setProcessingAction("batch-delete");
    try {
      await axios.post(`${API_BASE_URL}/campaigns/batch-delete`, { campaign_ids: selectedIds });
      setCampaigns((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      showToast({ tone: "success", title: "Campaigns deleted" });
    } catch (error) {
      console.error("Error in batch delete:", error);
      showToast({ tone: "error", title: "Batch delete failed", description: error?.response?.data?.detail || "Please try again." });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleBatchDeactivate = async () => {
    if (selectedIds.length === 0) return;
    setProcessingAction("batch-deactivate");
    try {
      await Promise.all(
        selectedIds.map((id) => axios.patch(`${API_BASE_URL}/campaigns/${id}/status?status=INACTIVE`))
      );
      setCampaigns((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      showToast({ tone: "success", title: "Campaigns deactivated" });
    } catch (error) {
      console.error("Error in batch deactivate:", error);
      showToast({ tone: "error", title: "Batch deactivate failed", description: error?.response?.data?.detail || "Please try again." });
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

  const totalCount = campaigns.length;
  const completedCount = campaigns.filter((c) => getStageProgress(c.status) === 100).length;
  const inProgressCount = totalCount - completedCount;
  const allSelected = filteredCampaigns.length > 0 && selectedIds.length === filteredCampaigns.length;

  return (
    <div className="space-y-6">
      <CampaignPageHeader
        title="Active Campaigns"
        count={!isLoading ? totalCount : undefined}
        description="Monitor, manage, and audit your high-intent pipeline outreach."
        action={
          <Button asChild>
            <Link to="/create">
              <Plus className="h-4 w-4 mr-1" />
              Launch Campaign
            </Link>
          </Button>
        }
      />

      <CampaignStats
        stats={[
          { label: "Total", value: totalCount, icon: Layers },
          { label: "In Progress", value: inProgressCount, icon: Activity },
          { label: "Completed", value: completedCount, icon: CheckCircle2 },
        ]}
      />

      <CampaignToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter by name, industry, or location…"
        sortOrder={sortOrder}
        onToggleSort={() => setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))}
        selectedCount={selectedIds.length}
        batchActions={
          selectedIds.length > 0 ? (
            <Button variant="outline" size="sm" disabled={processingAction !== null} onClick={handleBatchDeactivate}>
              {processingAction === "batch-deactivate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
              Deactivate ({selectedIds.length})
            </Button>
          ) : null
        }
        primaryActionLabel={processingAction === "batch-delete" ? "Deleting…" : "Delete"}
        primaryActionIcon={Trash2}
        onPrimaryAction={requestBatchDelete}
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
        <CampaignLoadingState message="Loading campaigns…" />
      ) : filteredCampaigns.length === 0 ? (
        <CampaignEmptyState
          icon={Target}
          title={searchQuery ? "No matching campaigns" : "No active campaigns yet"}
          description={
            searchQuery
              ? "No campaigns match your current search or filters."
              : "Launch your first campaign to start researching and reaching prospects."
          }
          actionLabel="Launch Campaign"
          actionTo="/create"
          showAction={!searchQuery}
        />
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              isSelected={selectedIds.includes(campaign.id)}
              onToggleSelect={() => toggleSelect(campaign.id)}
              onDeactivate={handleDeactivate}
              onDelete={requestDelete}
              processingId={processingId}
              processingAction={processingAction}
              mode="active"
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.type === "batch" ? `Delete ${selectedIds.length} campaigns?` : "Delete this campaign?"}
        description="This action is permanent and cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          const state = confirmState;
          setConfirmState(null);
          if (state?.type === "batch") handleBatchDelete();
          else if (state?.type === "single") handleDelete(state.id);
        }}
      />
    </div>
  );
};

export default ActiveCampaigns;
