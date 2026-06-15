import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ArrowUpDown,
  Trash2,
  Loader2,
  Square,
  CheckSquare,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const formatStatus = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED") return "Completed";
  if (s === "PENDING") return "Queued";
  if (s === "INPUT_VALIDATED") return "Validated";
  if (s === "INACTIVE") return "Inactive";
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

export const getStageProgress = (status) => {
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

export const getStatusBadgeVariant = (status) => {
  const s = String(status).toUpperCase();
  if (s === "COMPLETED" || s.includes("STAGE_6")) return "default";
  if (s === "FAILED" || s === "ERROR") return "destructive";
  if (s === "INACTIVE") return "secondary";
  return "outline";
};

export function CampaignPageHeader({ title, count, description, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {count !== undefined && (
            <Badge variant="secondary" className="tabular-nums">{count}</Badge>
          )}
        </div>
        {description && <p className="text-muted-foreground text-sm mt-1 max-w-xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CampaignStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CampaignToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  sortOrder,
  onToggleSort,
  selectedCount,
  batchActions,
  primaryActionLabel,
  primaryActionIcon: PrimaryIcon,
  onPrimaryAction,
  primaryDisabled,
  primaryLoading,
}) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {batchActions}
        {onPrimaryAction && (
          <Button
            variant={selectedCount > 0 ? "destructive" : "outline"}
            size="sm"
            disabled={primaryDisabled}
            onClick={onPrimaryAction}
          >
            {primaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : PrimaryIcon && <PrimaryIcon className="h-4 w-4" />}
            {primaryActionLabel}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onToggleSort}>
          <ArrowUpDown className="h-4 w-4 mr-1" />
          {sortOrder === "newest" ? "Newest" : "Oldest"}
        </Button>
      </div>
    </div>
  );
}

export function SelectAllRow({ allSelected, selectedCount, onToggle, disabled }) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {allSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
        {allSelected ? "Deselect all" : "Select all"}
      </button>
      {selectedCount > 0 && (
        <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
      )}
    </div>
  );
}

export function CampaignEmptyState({ icon: Icon, title, description, actionLabel, actionTo, showAction }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
        {showAction && actionTo && (
          <Button asChild>
            <Link to={actionTo}>
              <Plus className="h-4 w-4 mr-1" />
              {actionLabel}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function CampaignLoadingState({ message }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export function CampaignRow({
  campaign,
  isSelected,
  onToggleSelect,
  onDeactivate,
  onRestore,
  onDelete,
  processingId,
  processingAction,
  mode = "active",
}) {
  const initials = (campaign.name || "C")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const progress = getStageProgress(campaign.status);
  const isProcessing = processingId === campaign.id;

  return (
    <Card className={isSelected ? "border-primary/50 bg-primary/5" : ""}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onToggleSelect}
              className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input hover:border-primary/50"
              }`}
            >
              {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>

            {mode === "active" ? (
              <Link to={`/campaign/${campaign.id}`} className="flex items-start gap-3 min-w-0 flex-1 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs">
                  {initials}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{campaign.name}</h3>
                    <Badge variant={getStatusBadgeVariant(campaign.status)}>{formatStatus(campaign.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {[campaign.target_industry, campaign.target_location].filter(Boolean).join(" · ") || "Campaign setup validated"}
                  </p>
                  <div className="max-w-md space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Pipeline progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progress === 100 ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-start gap-3 min-w-0 flex-1 opacity-90">
                <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 font-semibold text-xs">
                  {initials}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{campaign.name}</h3>
                    <Badge variant="secondary">Archived</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {[campaign.target_industry, campaign.target_location].filter(Boolean).join(" · ") || "Campaign setup validated"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {mode === "active" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => onDeactivate(campaign.id)}
              >
                {isProcessing && processingAction === "deactivate" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => onRestore(campaign.id)}
              >
                {isProcessing && processingAction === "restore" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Restore
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              disabled={isProcessing}
              onClick={() => onDelete(campaign.id)}
            >
              {isProcessing && processingAction === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
