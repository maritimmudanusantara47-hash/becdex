import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status?: { name?: string; color?: string } | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status || !status.name) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        Unknown
      </span>
    );
  }

  const colorMap: Record<string, string> = {
    info: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    primary: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700",
    secondary: "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };

  const badgeStyle = colorMap[status.color || "secondary"] || colorMap.secondary;

  // Dot color matching
  const dotColorMap: Record<string, string> = {
    info: "bg-blue-500",
    warning: "bg-amber-500",
    success: "bg-emerald-500",
    danger: "bg-rose-500",
    primary: "bg-blue-600 dark:bg-blue-400",
    secondary: "bg-slate-400",
  };

  const dotStyle = dotColorMap[status.color || "secondary"] || "bg-slate-400";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs tracking-tight transition-all",
        badgeStyle,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotStyle)} />
      <span>{status.name}</span>
    </span>
  );
}
