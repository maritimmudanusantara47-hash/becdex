"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, UserPlus, Check, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

interface Assessor {
  id: number;
  name: string;
  email: string;
}

export default function AssessorTab({ submissionId }: { submissionId: string }) {
  const queryClient = useQueryClient();
  
  const { data: availableAssessors = [], isLoading: loadingAvailable } = useQuery<Assessor[]>({
    queryKey: ["available-assessors"],
    queryFn: async () => (await api.get('/admin/assessors/available')).data,
  });

  const { data: assignedAssessors = [], isLoading: loadingAssigned } = useQuery<Assessor[]>({
    queryKey: ["assigned-assessors", submissionId],
    queryFn: async () => (await api.get(`/admin/submissions/${submissionId}/assessors`)).data,
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync selectedIds with fetched assigned assessors
  useState(() => {
    if (assignedAssessors.length > 0 && selectedIds.length === 0) {
      setSelectedIds(assignedAssessors.map(a => a.id));
    }
  });

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const assignMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/submissions/${submissionId}/assessors`, { assessor_ids: selectedIds });
    },
    onSuccess: () => {
      toast.success("Asesor berhasil ditugaskan!");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["assigned-assessors", submissionId] });
      queryClient.removeQueries({ queryKey: ["activity-logs", submissionId] }); // Clear cache so it forces a loading state
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] }); // Refresh dashboard stats
    },
    onError: () => toast.error("Gagal menugaskan asesor."),
  });

  if (loadingAvailable || loadingAssigned) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
      <div className="mb-6">
        <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-2">Penugasan Tim Asesor</h3>
        <p className="text-sm text-slate-500">Pilih satu atau lebih asesor yang bertanggung jawab untuk memeriksa dan memverifikasi dokumen perusahaan ini.</p>
      </div>

      <div className="space-y-3 mb-6">
        {availableAssessors.map(assessor => {
          const isSelected = selectedIds.includes(assessor.id);
          return (
            <div 
              key={assessor.id} 
              onClick={() => toggleSelection(assessor.id)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
            >
              <div>
                <p className={`font-bold ${isSelected ? 'text-blue-800 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{assessor.name}</p>
                <p className="text-xs text-slate-500">{assessor.email}</p>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-transparent'}`}>
                <Check size={14} />
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        disabled={assignMutation.isPending}
        className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
      >
        <UserPlus size={16} />
        <span>Simpan Penugasan Asesor</span>
      </button>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !assignMutation.isPending && setIsModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-blue-900/20 border border-slate-200/50 dark:border-slate-700/50 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-100 dark:border-blue-900/50">
                <AlertCircle className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">Konfirmasi Penugasan</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Anda akan menugaskan <strong className="text-slate-800 dark:text-white">{selectedIds.length} asesor</strong> untuk memeriksa pengajuan ini. Lanjutkan?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={assignMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => assignMutation.mutate()}
                  disabled={assignMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {assignMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Ya, Simpan"}
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => !assignMutation.isPending && setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
