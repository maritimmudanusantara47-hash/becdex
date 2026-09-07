"use client";

/**
 * AdminCharts — lazy-loaded component untuk recharts di halaman admin dashboard.
 * Dipisah dari admin/page.tsx agar recharts tidak masuk bundle awal (code splitting).
 * Hanya akan dimuat setelah halaman admin selesai mount.
 */

import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["#2563eb", "#0ea5e9", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];

interface TrendEntry  { month: string; count: number }
interface SectorEntry { sector: string; count: number }

function CustomLegend({ payload }: { payload?: { value: string; color: string }[] }) {
  if (!payload?.length) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export function SubmissionTrendChart({ data }: { data: TrendEntry[] }) {
  if (!data?.length) {
    return <div className="flex items-center justify-center h-full text-slate-400 text-sm">Belum ada data tren</div>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
        <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} name="Total Pengajuan" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SectorPieChart({ data }: { data: SectorEntry[] }) {
  if (!data?.length) {
    return <div className="flex items-center justify-center h-full text-slate-400 text-sm">Belum ada data sektor</div>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="40%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="sector">
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: "12px" }} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
