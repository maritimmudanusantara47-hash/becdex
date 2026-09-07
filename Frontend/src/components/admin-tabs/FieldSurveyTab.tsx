"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, MapPin, Upload, Download, Save } from "lucide-react";
import { toast } from "sonner";

interface Survey {
  id: number;
  scheduled_at: string | null;
  notes: string | null;
  status: string;
  file_path: string | null;
  assessor: { name: string } | null;
}

export default function FieldSurveyTab({ submissionId }: { submissionId: string }) {
  const queryClient = useQueryClient();
  
  const { data: surveys = [], isLoading } = useQuery<Survey[]>({
    queryKey: ["field-surveys", submissionId],
    queryFn: async () => (await api.get(`/admin/submissions/${submissionId}/surveys`)).data,
  });

  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ scheduled_at: "", notes: "", status: "scheduled" });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [activeSurveyId, setActiveSurveyId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/submissions/${submissionId}/surveys`, form);
    },
    onSuccess: () => {
      toast.success("Survei lapangan berhasil ditambahkan!");
      setIsAdding(false);
      setForm({ scheduled_at: "", notes: "", status: "scheduled" });
      queryClient.invalidateQueries({ queryKey: ["field-surveys", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs", submissionId] });
    },
    onError: () => toast.error("Gagal menambahkan survei."),
  });

  const uploadMutation = useMutation({
    mutationFn: async (surveyId: number) => {
      if (!uploadFile) return;
      const formData = new FormData();
      formData.append("file", uploadFile);
      await api.post(`/admin/surveys/${surveyId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("File laporan berhasil diunggah!");
      setUploadFile(null);
      setActiveSurveyId(null);
      queryClient.invalidateQueries({ queryKey: ["field-surveys", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs", submissionId] });
    },
    onError: () => toast.error("Gagal mengunggah file laporan."),
  });

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-1">Log Kunjungan Observasi</h3>
          <p className="text-sm text-slate-500">Buku catatan internal tim asesor untuk mendokumentasikan bukti kunjungan fisik ke perusahaan.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer">
            + Tambah Catatan Kunjungan
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Jadwal Survei</label>
            <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan / Rencana</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 text-sm h-20" placeholder="Tulis catatan atau rencana apa saja yang akan disurvei..."></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-xs font-bold hover:bg-slate-300">Batal</button>
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2">
              {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
            </button>
          </div>
        </div>
      )}

      {surveys.length === 0 && !isAdding ? (
        <div className="p-10 text-center text-slate-500 text-sm">
          Belum ada log catatan kunjungan lapangan yang dibuat.
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.map(survey => (
            <div key={survey.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-blue-500" />
                    <span className="font-bold text-slate-800 dark:text-white">Jadwal: {survey.scheduled_at ? new Date(survey.scheduled_at).toLocaleString('id-ID') : 'Belum ditentukan'}</span>
                  </div>
                  <span className="text-xs text-slate-500">Asesor: {survey.assessor?.name ?? 'Tidak diketahui'}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${survey.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {survey.status}
                </span>
              </div>
              
              <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg mb-4 whitespace-pre-wrap">
                {survey.notes || <span className="italic text-slate-400">Tidak ada catatan.</span>}
              </div>

              {survey.file_path ? (
                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '')}/storage/${survey.file_path}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">
                  <Download size={14} /> Download Laporan (PDF/Foto)
                </a>
              ) : (
                <div>
                  {activeSurveyId === survey.id ? (
                    <div className="flex items-center gap-2">
                      <input type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} className="text-xs border p-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-white" />
                      <button onClick={() => uploadMutation.mutate(survey.id)} disabled={!uploadFile || uploadMutation.isPending} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 disabled:opacity-50">Upload</button>
                      <button onClick={() => setActiveSurveyId(null)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300">Batal</button>
                    </div>
                  ) : (
                    <button onClick={() => setActiveSurveyId(survey.id)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <Upload size={14} /> Unggah Laporan Survei
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
