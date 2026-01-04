import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  accent = "primary",
  icon,
}: {
  label: string;
  value: string | number;
  accent?: "primary" | "success" | "warning";
  icon?: ReactNode;
}) {
  const accentClass =
    accent === "success"
      ? "text-emerald-500"
      : accent === "warning"
        ? "text-amber-500"
        : "text-primary";

  return (
    <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      </div>
      <p className={cn("text-2xl font-semibold mt-2", accentClass)}>{value}</p>
    </div>
  );
}
