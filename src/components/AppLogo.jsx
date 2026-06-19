import { cn } from "@/lib/utils";

const sizeMap = {
  xs: { icon: 22, title: "text-sm", tagline: "text-[10px]" },
  sm: { icon: 28, title: "text-[15px]", tagline: "text-[10px]" },
  md: { icon: 34, title: "text-base", tagline: "text-[11px]" },
  lg: { icon: 44, title: "text-xl", tagline: "text-xs" },
  xl: { icon: 52, title: "text-2xl", tagline: "text-sm" },
};

export function AppLogo({
  collapsed = false,
  showWordmark = true,
  showTagline = false,
  tagline = "AI Outreach",
  size = "md",
  layout = "horizontal",
  className,
  iconClassName,
  lightText = true,
}) {
  const { icon, title, tagline: taglineSize } = sizeMap[size] || sizeMap.md;
  const showLabel = showWordmark && !collapsed;

  const mark = (
    <img
      src="/logo.png"
      alt="FocalReach"
      width={icon}
      height={icon}
      className={cn("shrink-0 drop-shadow-[0_0_10px_rgba(0,240,255,0.35)]", iconClassName)}
    />
  );

  const wordmark = (
    <div className="min-w-0 text-left">
      <p
        className={cn(
          "font-bold tracking-tight leading-none",
          title,
          lightText ? "text-white" : "text-foreground"
        )}
      >
        Focal<span className="text-[#00f0ff]">Reach</span>
      </p>
      {showTagline && (
        <p className={cn("mt-1 font-medium tracking-wide", taglineSize, lightText ? "text-zinc-500" : "text-muted-foreground")}>
          {tagline}
        </p>
      )}
    </div>
  );

  if (!showLabel) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        {mark}
      </div>
    );
  }

  if (layout === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
        {mark}
        <div>
          <p
            className={cn(
              "font-bold tracking-tight",
              title,
              lightText ? "text-white" : "text-foreground"
            )}
          >
            Focal<span className="text-[#00f0ff]">Reach</span>
          </p>
          {showTagline && (
            <p className={cn("mt-1.5 font-medium tracking-wide", taglineSize, lightText ? "text-zinc-500" : "text-muted-foreground")}>
              {tagline}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      {mark}
      {wordmark}
    </div>
  );
}
