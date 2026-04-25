export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

export const ensureAbsoluteUrl = (url) => {
  if (!url || url === "#" || url === "N/A") return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

export const cleanEmailReply = (body) => {
  if (!body) return "";
  const patterns = [
    /\n\s*On\s+.*\s+wrote:/i,
    /\n\s*-+\s*Original Message\s*-+/i,
    /\n\s*From:/i,
    /\n\s*> /,
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

export const getCampaignDisplayStatus = (campaign) => {
  if (!campaign) return "NEW";

  const companies = campaign.target_companies || [];
  const allFinalized =
    companies.length > 0 &&
    companies.every((company) => company.status === "MEETING_BOOKED" || company.status === "TERMINATED");
  if (allFinalized) return "COMPLETED";

  switch (String(campaign.status).toUpperCase()) {
    case "RESEARCHING_USER_COMPANY":
      return "RESEARCHING";
    case "FINDING_TARGET_COMPANIES":
      return "IDENTIFYING TARGETS";
    case "FINDING_DECISION_MAKERS":
      return "MAPPING STAKEHOLDERS";
    case "DRAFTING_EMAILS":
      return "DRAFTING OUTREACH";
    case "COMPLETED":
      return "MONITORING";
    default:
      return campaign.status || "NEW";
  }
};
