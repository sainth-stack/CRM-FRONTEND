import { useMemo, useState } from "react";
import { Globe } from "lucide-react";

import { ensureAbsoluteUrl } from "../../pages/campaignWorkspace/workspaceUtils";

const SIZE_MAP = {
  sm: "w-12 h-12 rounded-2xl text-sm",
  md: "w-16 h-16 rounded-3xl text-lg",
  lg: "w-20 h-20 rounded-3xl text-2xl",
};

const getInitials = (companyName) => {
  if (!companyName) return "AI";
  const parts = companyName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "AI";
};

const getFaviconUrl = (website) => {
  if (!website || website === "#" || website === "N/A") return null;

  try {
    const absolute = ensureAbsoluteUrl(website);
    const parsed = new URL(absolute);
    return `${parsed.origin}/favicon.ico`;
  } catch {
    return null;
  }
};

const CompanyIdentityBadge = ({ companyName, website, size = "md" }) => {
  const [showImage, setShowImage] = useState(Boolean(website));
  const initials = useMemo(() => getInitials(companyName), [companyName]);
  const faviconUrl = useMemo(() => getFaviconUrl(website), [website]);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={`${sizeClasses} shrink-0 bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden text-brand-primary`}
      aria-label={`${companyName || "Company"} identity badge`}
    >
      {showImage && faviconUrl ? (
        <img
          src={faviconUrl}
          alt={`${companyName || "Company"} logo`}
          className="w-full h-full object-contain p-2"
          onError={() => setShowImage(false)}
        />
      ) : companyName ? (
        <span className="font-black tracking-tight uppercase">{initials}</span>
      ) : (
        <Globe size={24} strokeWidth={2.5} />
      )}
    </div>
  );
};

export default CompanyIdentityBadge;
