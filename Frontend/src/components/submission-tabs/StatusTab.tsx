"use client";

import { CheckCircle2, Clock, Circle, MapPin, Calendar, History, Activity } from "lucide-react";
import { MdCelebration } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { SubmissionDetail } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { useTranslation } from "@/store/lang";

interface Props {
  submission: SubmissionDetail;
}

interface ActivityLogItem {
  id: number;
  action: string;
  description: string;
  created_at: string;
  user?: {
    name: string;
  };
}

// Alur Bisnis Baru: Document Submission (2) -> Payment (1) -> Verification (3) -> Revision (4) -> Approved (8) -> Survey (7) -> Certified (5)
const STATUSES = [
  {
    id: 2,
    label: "Document Submission",
    desc: "Unggah dokumen pendukung dan lengkapi kuesioner assessment",
  },
  {
    id: 1,
    label: "Pending Payment",
    desc: "Menunggu pembayaran biaya administrasi sertifikasi",
  },
  {
    id: 3,
    label: "On Verification Process",
    desc: "Tim penilai admin sedang memverifikasi berkas dan skor Anda",
  },
  {
    id: 6,
    label: "Payment Successful",
    desc: "Pembayaran telah diterima, menunggu proses verifikasi oleh Admin",
  },
  {
    id: 4,
    label: "Document Revision",
    desc: "Perbaikan atau unggah ulang berkas dokumen yang direvisi",
  },
  {
    id: 8,
    label: "Approved & Ready for Survey",
    desc: "Dokumen disetujui, menunggu jadwal survei lapangan",
  },
  {
    id: 7,
    label: "Location Survey",
    desc: "Survei lokasi lapangan & wawancara sedang berlangsung",
  },
  { id: 5, label: "Certified Blue Economy", desc: <>Proses sertifikasi selesai dan resmi diterbitkan <MdCelebration className="inline text-amber-500 w-4 h-4 mb-1" /></> },
];

const ORDERED_FLOW = [2, 1, 6, 3, 4, 8, 7, 5];

export function StatusTab({ submission }: Props) {
  const { t } = useTranslation();
  const currentStatusId = submission.status.id;
  const currentIndex = ORDERED_FLOW.indexOf(currentStatusId);

  const { data: logsData } = useQuery({
    queryKey: ["activity-logs", submission.id],
    queryFn: async () => {
      const res = await api.get(`/submissions/${submission.id}/activity-logs`);
      return res.data;
    },
  });
  const logs = logsData || [];

  const hasRevision = logs.some((l: ActivityLogItem) => l.action?.includes('return'));

  const passedIds = new Set<number>();
  for (let i = 0; i < currentIndex; i++) {
    const flowId = ORDERED_FLOW[i];
    if (flowId === 4 && !hasRevision) {
      continue; // Skip marking 4 as passed if no revision occurred
    }
    passedIds.add(flowId);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* TailAdmin Timeline Wrapper Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 md:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <History size={20} className="text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">
                Alur Timeline & Riwayat Status Pengajuan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lacak perkembangan pengajuan indeks Blue Economy perusahaan Anda secara transparan
              </p>
            </div>
          </div>
          <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/60 shrink-0">
            {submission.status.name}
          </span>
        </div>

        <div className="relative pt-2 pl-2 md:pl-4">
          {/* Vertical connection line */}
          <div className="absolute left-6.5 md:left-8.5 top-6 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800" />

          <div className="space-y-8">
            {STATUSES.map((s) => {
              const isActive = s.id === currentStatusId;
              const isPassed = passedIds.has(s.id);
              // Status 4 (2nd attempt) is optional — show as skipped if we pass it without being active
              const isSkipped =
                s.id === 4 &&
                !isActive &&
                !isPassed &&
                currentIndex > ORDERED_FLOW.indexOf(4);

              return (
                <div key={s.id} className="flex items-start gap-4 md:gap-6 relative group">
                  {/* Step Icon */}
                  <div
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 z-10 border-2 transition-all shadow-2xs",
                      isActive
                        ? "bg-[#0c2340] border-[#0c2340] text-white dark:bg-blue-600 dark:border-blue-500 shadow-md shadow-[#0c2340]/20 scale-105"
                        : isPassed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isSkipped
                        ? "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                    )}
                  >
                    {isPassed ? (
                      <CheckCircle2 size={20} />
                    ) : isActive ? (
                      <Clock size={20} className="animate-pulse text-blue-300 dark:text-white" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </div>

                  {/* Step Content Card */}
                  <div
                    className={cn(
                      "flex-1 rounded-2xl p-4 border transition-all",
                      isActive
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/80 shadow-xs"
                        : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-extrabold tracking-tight",
                          isActive
                            ? "text-[#0c2340] dark:text-blue-300"
                            : isPassed
                            ? "text-slate-800 dark:text-slate-100"
                            : "text-slate-400 dark:text-slate-500"
                        )}
                      >
                        {s.label}
                      </p>

                      <div className="flex items-center gap-1.5">
                        {isActive && (
                          <span className="text-[11px] bg-[#0c2340] text-white dark:bg-blue-600 px-2.5 py-0.5 rounded-full font-bold shadow-2xs">
                            Tahap Saat Ini
                          </span>
                        )}
                        {isPassed && (
                          <span className="text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800/60">
                            Selesai
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-[11px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-bold">
                            Dilewati
                          </span>
                        )}
                      </div>
                    </div>

                    <p
                      className={cn(
                        "text-xs md:text-sm mt-1 leading-relaxed font-medium",
                        isActive || isPassed
                          ? "text-slate-600 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    >
                      {s.desc}
                    </p>

                    {/* Survey Details inside active step */}
                    {s.id === 7 && isActive && submission.survey && (
                      <div className="mt-3 bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-blue-200/80 dark:border-blue-900/60 text-xs space-y-2 shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                          <Calendar size={14} className="text-blue-500 mt-0.5" />
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{t.tab_status_survey_schedule || "Jadwal Survei Lapangan:"} {formatDate(submission.survey.scheduled_at)}</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap">{submission.survey.notes}</p>
                        {submission.survey.location_link && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-blue-600 dark:text-blue-400" />
                            <a
                              href={submission.survey.location_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                            >
                              Buka Tautan Peta Lokasi
                            </a>
                          </div>
                        )}
                        {submission.survey.notes && (
                          <p className="text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            &quot;{submission.survey.notes}&quot;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 md:p-8 shadow-2xs mt-8">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <Activity size={20} className="text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">
              Log Aktivitas (Audit Trail)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Catatan sistem mengenai semua tindakan yang dilakukan pada pengajuan ini
            </p>
          </div>
        </div>

        {logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log: ActivityLogItem) => (
              <div key={log.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-2" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="text-xs text-slate-500 font-mono">{formatDate(log.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">{log.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      Oleh: {log.user?.name || 'Sistem'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">Belum ada aktivitas tercatat.</div>
        )}
      </div>
    </div>
  );
}
