export function AppLogo({ collapsed = false }) {
  if (collapsed) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "#2a4a6a" }}>
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0" style={{ background: "#2a4a6a" }}>
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-white truncate">FocalReach</p>
        <p className="text-[10px] truncate" style={{ color: "#7a9ab5" }}>AI Outreach</p>
      </div>
    </div>
  );
}
