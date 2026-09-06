import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "muted" | "online" | "offline" | "busy" | "cod" | "sim";
}) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    online: "bg-online/15 text-online",
    offline: "bg-offline/10 text-offline",
    busy: "bg-busy/15 text-busy",
    cod: "bg-cod/12 text-cod",
    sim: "bg-paper text-sim",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
