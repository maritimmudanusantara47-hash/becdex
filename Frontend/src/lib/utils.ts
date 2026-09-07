import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getStatusColor(color: string): string {
  const map: Record<string, string> = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    primary: "bg-indigo-100 text-indigo-800",
    secondary: "bg-gray-100 text-gray-800",
    light: "bg-slate-100 text-slate-700",
  };
  return map[color] || "bg-gray-100 text-gray-800";
}

export function getScoreCategory(score: number): {
  label: string;
  color: string;
} {
  if (score >= 89) return { label: "Excellent", color: "text-emerald-600" };
  if (score >= 79) return { label: "Good", color: "text-blue-600" };
  if (score >= 69) return { label: "Standard", color: "text-yellow-600" };
  return { label: "Not Certified", color: "text-red-600" };
}
