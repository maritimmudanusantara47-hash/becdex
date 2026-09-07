"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, FolderOpen } from "lucide-react";
import { SubmissionDetail, ScoreData } from "@/types";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/store/lang";

interface Props {
  submission: SubmissionDetail;
}

export function DocumentsTab({ submission }: Props) {
  const { t } = useTranslation();

  // Fetch min_documents dari API score
  const { data: scoreData } = useQuery<{ data: ScoreData }>({
    queryKey: ["score", submission.id],
    queryFn: async () => {
      const res = await api.get(`/submissions/${submission.id}/score`);
      return res.data;
    },
  });

  const uploadedDocsByIndicator = new Map<number, typeof submission.documents>();
  for (const doc of submission.documents ?? []) {
    if (!uploadedDocsByIndicator.has(doc.indicator_id)) {
      uploadedDocsByIndicator.set(doc.indicator_id, []);
    }
    uploadedDocsByIndicator.get(doc.indicator_id)!.push(doc);
  }

  const docsUploaded = submission.documents_uploaded ?? 0;
  const totalRequired = scoreData?.data?.requirements?.min_documents ?? 35;

  // Hanya tampilkan indikator yang dijawab "Ya" (ada dokumen yang perlu diunggah)
  const eligibleIndicators = (submission.per_indicators ?? []).filter((pi) => {
    return pi.indicator.questions.some((q) => {
      const answer = submission.answers.find((a) => a.question_id === q.id);
      if (!answer || answer.value === null || answer.value === undefined) return false;
      const numValue = parseFloat(String(answer.value));
      return !isNaN(numValue) && numValue > 0;
    });
  });

  return (
    <div>
      {/* Progress */}
      <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 rounded-2xl p-5 shadow-2xs mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Progres Unggah Dokumen Verifikasi
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
            Minimal {totalRequired} dokumen diperlukan untuk tahap verifikasi &amp; pembayaran
          </p>
        </div>
        <div className="text-right">
          <span
            className={cn(
              "text-2xl md:text-3xl font-extrabold tracking-tight",
              docsUploaded >= totalRequired
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-[#0c2340] dark:text-blue-300"
            )}
          >
            {docsUploaded}
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-xs font-bold"> / {totalRequired}</span>
        </div>
      </div>

      {/* Info banner — read only */}
      <div className="mb-5 flex items-center gap-2.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300 font-medium">
        <FolderOpen size={15} className="shrink-0" />
        <span>Tab ini hanya untuk melihat dokumen yang telah diunggah. Untuk mengunggah dokumen, silakan gunakan tab <strong>Assessment Kuesioner</strong>.</span>
      </div>

      {/* Indicator List */}
      <div className="space-y-3">
        {eligibleIndicators.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl transition-colors">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500">{t.tab_doc_empty || "Belum Ada Dokumen untuk Ditampilkan"}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
              Silakan isi kuesioner assessment terlebih dahulu dan jawab &quot;Ya&quot; pada indikator yang sesuai dengan perusahaan Anda.
            </p>
          </div>
        ) : (
          eligibleIndicators.map((pi) => {
            const docs = uploadedDocsByIndicator.get(pi.indicator_id) ?? [];
            const hasDoc = docs.length > 0;

            const isRevision = pi.status?.id === 5;

            return (
              <div
                key={pi.id}
                className={cn(
                  "border rounded-2xl p-5 shadow-2xs transition-all",
                  isRevision
                    ? "border-amber-400 bg-amber-50/40 dark:border-amber-700 dark:bg-amber-950/40 ring-2 ring-amber-400/50"
                    : hasDoc
                    ? "border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-800/60 dark:bg-emerald-950/20"
                    : "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs",
                        isRevision
                          ? "bg-amber-500 animate-ping"
                          : hasDoc
                          ? "bg-emerald-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      )}
                    />
                    <span className="text-sm md:text-base font-extrabold text-slate-800 dark:text-white truncate tracking-tight">
                      {pi.indicator.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isRevision && (
                      <span className="bg-amber-400 text-amber-950 dark:bg-amber-600 dark:text-white font-extrabold px-2.5 py-0.5 rounded-md text-[10px] animate-pulse">
                        ⚠️ Butuh Revisi
                      </span>
                    )}
                    <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-semibold px-2.5 py-1 rounded-lg text-[11px] shrink-0 border border-blue-100 dark:border-blue-900/50">
                      {pi.indicator.principle.name}
                    </span>
                  </div>
                </div>

                {/* Auditor Revision Note */}
                {(pi.comment || isRevision) && (
                  <div className="mb-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 shadow-2xs flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold shrink-0 mt-0.5">!</span>
                    <div>
                      <span className="font-extrabold uppercase tracking-wider text-[10px] block text-amber-800 dark:text-amber-300 mb-0.5">
                        Catatan &amp; Instruksi Revisi Auditor
                      </span>
                      <p className="font-bold leading-relaxed">{pi.comment ? `"${pi.comment}"` : "Silakan periksa kembali jawaban dan berkas pendukung pada indikator ini."}</p>
                    </div>
                  </div>
                )}

                {/* Uploaded Docs — view only */}
                {docs.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Berkas Pendukung Diunggah ({docs.length}):
                    </p>
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl px-3.5 py-2.5 border border-slate-200/60 dark:border-slate-700/80 shadow-xs"
                      >
                        <FileText size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs md:text-sm text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-300 truncate font-semibold transition-colors block"
                          >
                            {doc.original_name}
                          </a>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {doc.upload_phase === 3
                              ? "Diunggah saat revisi survei"
                              : doc.upload_phase === 2
                              ? "Diunggah saat revisi"
                              : "Diunggah saat pengajuan awal"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic text-center py-3">
                    {t.tab_doc_no_support || "Belum ada berkas pendukung diunggah untuk indikator ini"}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
