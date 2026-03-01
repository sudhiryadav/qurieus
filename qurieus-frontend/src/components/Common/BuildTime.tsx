"use client";

/**
 * Shows deployment/build time in user's local timezone.
 * NEXT_PUBLIC_BUILD_TIME is set during deploy (UTC). Locally, falls back to "dev".
 */
export default function BuildTime() {
  const raw = process.env.NEXT_PUBLIC_BUILD_TIME;
  if (!raw) return <span className="hidden sm:inline text-[10px] text-muted-foreground/70">dev</span>;

  try {
    // Parse "2025-03-01 12:34 UTC" as UTC, display in local time
    const iso = raw.replace(" ", "T").replace(" UTC", "Z");
    const utcDate = new Date(iso);
    const localStr = utcDate.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
    return (
      <span
        className="hidden sm:inline text-[10px] text-muted-foreground/70"
        title={`Deployed: ${localStr} (local)`}
      >
        {localStr}
      </span>
    );
  } catch {
    return <span className="hidden sm:inline text-[10px] text-muted-foreground/70">{raw}</span>;
  }
}
