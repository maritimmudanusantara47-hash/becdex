"use client";

import React from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Monitor, Smartphone, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Session {
  id: string;
  ip_address: string;
  user_agent: string;
  last_activity: string;
  is_current_device: boolean;
}

export function ActiveSessions() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      const res = await api.get("/auth/sessions");
      return res.data.data;
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/auth/sessions/${id}`);
    },
    onSuccess: () => {
      toast.success("Perangkat berhasil dikeluarkan.");
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
    },
    onError: (err) => {
      toast.error("Gagal mengeluarkan perangkat.");
      console.error(err);
    },
  });

  const handleRevoke = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin mengeluarkan perangkat ini?")) return;
    revokeMutation.mutate(id);
  };

  const getDeviceIcon = (userAgent: string) => {
    const isMobile = /Mobile|Android|iP(hone|od|ad)/i.test(userAgent);
    return isMobile ? <Smartphone className="text-gray-500" /> : <Monitor className="text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 font-sans mt-6">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Perangkat Aktif</h3>
      <p className="text-sm text-slate-500 mb-4">
        Daftar perangkat yang saat ini masuk ke akun Anda. Anda dapat mengeluarkan perangkat yang tidak dikenali.
      </p>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-slate-700 rounded-full shadow-xs">
                {getDeviceIcon(session.user_agent)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span>{session.user_agent.length > 50 ? session.user_agent.substring(0, 50) + "..." : session.user_agent}</span>
                  {session.is_current_device && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Perangkat Ini
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Aktivitas terakhir: {session.last_activity}
                </p>
              </div>
            </div>
            {!session.is_current_device && (
              <button
                onClick={() => handleRevoke(session.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Keluarkan Perangkat"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
