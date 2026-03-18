import React from "react";

import { cn } from "@/lib/utils";

export interface VolumePoint {
  date: string;
  amount: string;
}

export function VolumeChart({
  points,
  className
}: {
  points: VolumePoint[];
  className?: string;
}) {
  const values = points.map((point) => Number(point.amount));
  const maximum = Math.max(...values, 0);

  if (points.length === 0) {
    return <div className={cn("text-sm text-muted-foreground", className)}>No activity yet.</div>;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex h-48 items-end gap-2 rounded-[24px] border border-border/70 bg-background/70 p-4">
        {points.map((point) => {
          const value = Number(point.amount);
          const height = maximum > 0 ? Math.max(12, (value / maximum) * 100) : 12;

          return (
            <div key={point.date} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div
                className={cn(
                  "w-full rounded-t-full bg-gradient-to-t from-[color:var(--chart-2)] to-[color:var(--chart-1)]",
                  value === 0 && "opacity-25"
                )}
                style={{ height: `${height}%` }}
                title={`${point.date}: ${point.amount} USDC`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {points
          .filter((_, index) => index % 4 === 0 || index === points.length - 1)
          .map((point) => (
            <span key={point.date}>{point.date.slice(5)}</span>
          ))}
      </div>
    </div>
  );
}
