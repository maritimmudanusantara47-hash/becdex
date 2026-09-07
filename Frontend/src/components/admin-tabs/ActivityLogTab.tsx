"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, Activity } from "lucide-react";

interface Log {
  id: number;
  user: { name: string; email: string } | null;
  action: string;
  description: string;
  created_at: string;
}

export default function ActivityLogTab({ submissionId }: { submissionId: string }) {
  const { data: logs = [], isLoading } = useQuery<Log[]>({
    queryKey: ["activity-logs", submissionId],
    queryFn: async () => (await api.get(`/admin/submissions/${submissionId}/activity-logs`)).data,
  });

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
      <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-1">Audit Trail (Rekam Jejak)</h3>
          <p className="text-sm text-slate-500">Mencatat seluruh aktivitas perubahan skor dan status oleh Asesor / Admin.</p>
        </div>
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
          <Activity size={20} />
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">Belum ada aktivitas yang terekam.</div>
      ) : (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="relative pl-6">
              <span className="absolute -left-2.25 top-1.5 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500 ring-4 ring-white dark:ring-slate-900" />
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm text-slate-800 dark:text-white">
                    {log.user ? log.user.name : "Sistem"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{log.description}</p>
                <div className="mt-2 inline-block px-2 py-0.5 bg-slate-200/50 dark:bg-slate-900/50 text-[10px] font-mono rounded text-slate-500">
                  ACTION: {log.action.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
