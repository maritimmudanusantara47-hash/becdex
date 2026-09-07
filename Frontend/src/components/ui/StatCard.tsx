import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "green" | "yellow" | "red" | "indigo" | "navy";
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
}

const colorMap = {
  navy: {
    bg: "bg-blue-50 dark:bg-[#0c2340]/60",
    icon: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200/80 dark:border-blue-800",
    accent: "bg-blue-600",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/50",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-900/40",
    accent: "bg-blue-600",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    icon: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-900/40",
    accent: "bg-emerald-600",
  },
  yellow: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    icon: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-900/40",
    accent: "bg-amber-600",
  },
  red: {
    bg: "bg-rose-50 dark:bg-rose-950/50",
    icon: "text-rose-600 dark:text-rose-400",
    border: "border-rose-100 dark:border-rose-900/40",
    accent: "bg-rose-600",
  },
  indigo: {
    bg: "bg-sky-50 dark:bg-sky-950/50",
    icon: "text-sky-600 dark:text-sky-400",
    border: "border-sky-100 dark:border-sky-900/40",
    accent: "bg-sky-600",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
  trend,
  trendUp = true,
}: StatCardProps) {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-2xs hover:shadow-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Top Accent line on hover */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          colors.accent
        )}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 pr-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400 line-clamp-2 leading-snug min-h-8">
            {title}
          </span>
          <h4 
            className="mt-1 text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate"
            title={String(value)}
          >
            {value}
          </h4>
        </div>

        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 shadow-2xs",
            colors.bg,
            colors.border
          )}
        >
          <Icon className={cn("w-6 h-6", colors.icon)} strokeWidth={2} />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-400 dark:text-slate-500 font-medium truncate">
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px]",
                trendUp
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
              )}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
