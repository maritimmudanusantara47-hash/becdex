"use client";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  label: string;
  max?: number;
  className?: string;
}

export function ScoreGauge({ score, label, max = 100, className }: ScoreGaugeProps) {
  const percentage = Math.min((score / max) * 100, 100);

  const getColor = () => {
    if (percentage >= 89) return "bg-emerald-500 shadow-sm shadow-emerald-500/30";
    if (percentage >= 79) return "bg-blue-600 dark:bg-blue-500 shadow-sm shadow-blue-500/30";
    if (percentage >= 69) return "bg-amber-500 shadow-sm shadow-amber-500/30";
    return "bg-rose-500 shadow-sm shadow-rose-500/30";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center text-xs md:text-sm">
        <span className="font-extrabold text-slate-700 dark:text-slate-200 tracking-tight">{label}</span>
        <span className="font-mono font-extrabold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
          {score.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
        <div
          className={cn("h-full rounded-full transition-all duration-700", getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="w-8 h-8 border-4 border-[#0c2340] dark:border-blue-500 border-t-transparent rounded-full animate-spin shadow-xs" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-950/60 rounded-2xl mb-4 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-white mb-1.5 tracking-tight">{title}</h3>
      {description && <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-5 max-w-md mx-auto leading-relaxed">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
