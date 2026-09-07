"use client";

import { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layouts/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ScoreGauge, LoadingSpinner } from "@/components/ui/index";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, XCircle, ChevronDown, ChevronRight,
  FileText, Loader2, Award, MapPin, Building2, BookOpen, Scale,
  ShieldCheck, Mail, Briefcase, Calendar, ExternalLink, X, AlertTriangle, Users, FileSearch, Activity, MessageSquare, Info
} from "lucide-react";
import { MdFolder } from "react-icons/md";
import AssessorTab from "@/components/admin-tabs/AssessorTab";
import ActivityLogTab from "@/components/admin-tabs/ActivityLogTab";
import FieldSurveyTab from "@/components/admin-tabs/FieldSurveyTab";
import { IndicatorChat } from "@/components/submission-tabs/IndicatorChat";
import { useTranslation } from "@/store/lang";
import { useAuthStore } from "@/store/auth";
import { canIssueCertificate, canVerifySubmissions, isSuperAdmin } from "@/lib/roles";
import { useAdminRouteGuard } from "@/hooks/useAdminRouteGuard";

interface IndicatorDoc { id: number; file_url: string; original_name: string; upload_phase?: number; }
interface IndicatorQuestion { id: number; text: string; text_en?: string | null; }

interface PerIndicatorItem {
  id: number;
  indicator_id: number;
  comment: string | null;
  status: { id: number; name: string; color: string };
  indicator: {
    name: string;
    name_id?: string | null;
    description?: string | null;
    description_en?: string | null;
    evidence?: string | null;
    evidence_en?: string | null;
    verification_method?: string | null;
    verification_method_en?: string | null;
    regulation?: string | null;
    regulation_en?: string | null;
    principle: { name: string; name_id?: string | null; outcome: { name: string; name_id?: string | null; aspect: { name: string; name_id?: string | null } } };
    questions: IndicatorQuestion[];
  };
}
interface AnswerItem { question_id: number; value: number | null; valid_value?: number | null; }
interface SubmissionData {
  id: string;
  initial_score: number;
  valid_score: number;
  documents_uploaded?: number;
  status: { id: number; name: string; color: string };
  user?: { name?: string; email?: string; company?: { pic_name?: string; pic_position?: string; pic_email?: string } };
  per_indicators?: PerIndicatorItem[];
  documents?: (IndicatorDoc & { indicator_id: number })[];
  answers?: AnswerItem[];
  revision_count?: number;
  survey?: { scheduled_at: string; location_link?: string; notes?: string };
}

export default function AdminSubmissionDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = typeof (params as any)?.then === "function" ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const id = resolvedParams?.id;
  const { user } = useAuthStore();
  const { t, locale } = useTranslation();
  const { authorized } = useAdminRouteGuard({ guard: "submission_reader" });
  
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"verification" | "assessors" | "survey" | "logs">("verification");
  const [expandedIndicators, setExpandedIndicators] = useState<Set<number>>(new Set());
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [showScoringGuide, setShowScoringGuide] = useState(false);
  const [surveyForm, setSurveyForm] = useState({ scheduled_at: "", location_link: "", notes: "" });
  const [certForm, setCertForm] = useState({ certificate_id: "10", becdex_category_id: "3", published_at: "", mmic: "", direktur: "" });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/submissions/${id}`);
    },
    onSuccess: () => {
      toast.success("Pengajuan berhasil dihapus.");
      router.push("/admin/submissions");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menghapus pengajuan.");
    },
  });

  const { data, isLoading, refetch } = useQuery<{ data: SubmissionData }>({
    queryKey: ["admin-submission", id],
    queryFn: async () => {
      const res = await api.get(`/admin/submissions/${id}`);
      return res.data;
    },
    enabled: authorized,
    staleTime: 0,
    gcTime: 0,
  });

  const indicatorMutation = useMutation({
    mutationFn: async ({ indicatorId, statusId, comment, valid_values }: { indicatorId: number; statusId: number; comment?: string; valid_values?: Array<{ question_id: number; valid_value: number }> }) => {
      await api.put(`/admin/submissions/${id}/indicators/${indicatorId}`, {
        status_id: statusId,
        comment,
        valid_values,
      });
    },
    onSuccess: () => {
      toast.success(t.dash_admin_sub_id_msg_ind_success || "Status verifikasi indikator diperbarui!");
      refetch();
    },
    onError: () => toast.error(t.dash_admin_sub_id_msg_ind_error || "Gagal memperbarui status indikator."),
  });

  const surveyMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/submissions/${id}/survey`, surveyForm);
    },
    onSuccess: () => {
      toast.success(t.dash_admin_sub_id_msg_surv_success || "Jadwal survei lokasi berhasil disimpan!");
      setShowSurveyModal(false);
      refetch();
    },
    onError: () => toast.error(t.dash_admin_sub_id_msg_surv_error || "Gagal menjadwalkan survei lokasi."),
  });

  const certMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/submissions/${id}/certificate`, certForm);
    },
    onSuccess: () => {
      toast.success(t.dash_admin_sub_id_msg_cert_success || "Sertifikat resmi BECdex berhasil diterbitkan!");
      setShowCertModal(false);
      refetch();
    },
    onError: () => toast.error(t.dash_admin_sub_id_msg_cert_error || "Gagal menerbitkan sertifikat."),
  });

  const submission = data?.data;

  const toggleIndicator = (indicatorId: number) => {
    setExpandedIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(indicatorId)) {
        next.delete(indicatorId);
      } else {
        next.add(indicatorId);
      }
      return next;
    });
  };

  const isAdminEditable = [2, 3, 4, 6, 7].includes(Number(submission?.status?.id));

  const returnMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/submissions/${id}/return`, { reason: returnReason });
    },
    onSuccess: () => {
      toast.success(t.dash_admin_sub_id_msg_return_success || "Pengajuan berhasil dikembalikan ke perusahaan untuk direvisi.");
      setShowReturnModal(false);
      setReturnReason("");
      refetch();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || (t.dash_admin_sub_id_msg_return_error || "Gagal mengembalikan pengajuan."));
    },
  });

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [infoModalIndicator, setInfoModalIndicator] = useState<{
    name: string;
    description?: string | null;
    evidence?: string | null;
    verification_method?: string | null;
    regulation?: string | null;
  } | null>(null);

  const approveMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/submissions/${id}/approve`);
    },
    onSuccess: () => {
      toast.success("Verifikasi selesai! Pengajuan siap dijadwalkan untuk survei lapangan.");
      refetch();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal meluluskan pengajuan.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/submissions/${id}/reject`, { reason: rejectReason });
    },
    onSuccess: () => {
      toast.success("Pengajuan berhasil ditolak permanen.");
      setShowRejectModal(false);
      setRejectReason("");
      refetch();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal menolak pengajuan.");
    },
  });

  const grouped = new Map<string, Map<string, Map<string, PerIndicatorItem[]>>>();
  for (const pi of submission?.per_indicators ?? []) {
    const aspect = pi.indicator.principle.outcome.aspect.name;
    const outcome = pi.indicator.principle.outcome.name;
    const principle = pi.indicator.principle.name;

    if (!grouped.has(aspect)) grouped.set(aspect, new Map());
    const outcomeMap = grouped.get(aspect)!;
    if (!outcomeMap.has(outcome)) outcomeMap.set(outcome, new Map());
    const principleMap = outcomeMap.get(outcome)!;
    if (!principleMap.has(principle)) principleMap.set(principle, []);
    principleMap.get(principle)!.push(pi);
  }

  const indicatorNumberMap = useMemo(() => {
    const map = new Map<number, number>();
    let counter = 0;
    for (const pi of submission?.per_indicators ?? []) {
      if (!map.has(pi.indicator_id)) {
        map.set(pi.indicator_id, ++counter);
      }
    }
    return map;
  }, [submission?.per_indicators]);

  const principleNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    let counter = 0;
    for (const pi of submission?.per_indicators ?? []) {
      const pName = pi.indicator.principle.name;
      if (!map.has(pName)) {
        map.set(pName, ++counter);
      }
    }
    return map;
  }, [submission?.per_indicators]);

  const uploadedIndicatorsCount = useMemo(() => {
    if (!submission?.documents) return 0;
    return new Set(submission.documents.map((d) => (d as IndicatorDoc & { indicator_id: number }).indicator_id)).size;
  }, [submission?.documents]);

  if (!authorized) return null;

  if (isLoading) {
    return (
      <AppLayout title={t.dash_admin_sub_id_title || "Review & Verifikasi Auditor"}>
        <div className="py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!submission) {
    return (
      <AppLayout title={t.dash_admin_sub_id_review_title || "Review Submission"}>
        <div className="py-20 text-center">
          <p className="text-rose-500 font-bold text-sm">{t.dash_admin_sub_id_not_found || "Data submission tidak ditemukan."}</p>
        </div>
      </AppLayout>
    );
  }

  const isCertified = Number(submission.status.id) === 5;
  const unverifiedCount = submission.per_indicators?.filter(pi => Number(pi.status.id) === 3).length || 0;

  return (
    <AppLayout title={t.dash_admin_sub_id_title || "Review & Verifikasi Auditor"}>
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/admin/submissions"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>{t.dash_admin_sub_id_back || "Kembali ke Daftar Submission"}</span>
        </Link>

        {isSuperAdmin(user) && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/50 dark:hover:bg-rose-900/80 dark:text-rose-400 font-bold text-xs transition-all shadow-2xs"
            title="Hapus Pengajuan (Hanya Super Admin)"
          >
            <X size={14} />
            <span>Hapus Pengajuan</span>
          </button>
        )}
      </div>

      {/* Warning Revision Limit — only show during active verification/survey */}
      {[2, 3, 4, 6, 7].includes(Number(submission.status.id)) && (submission.revision_count ?? 0) >= 1 ? (
        <div className="mb-6 flex items-start gap-3.5 bg-rose-50/80 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-5 shadow-2xs">
          <XCircle size={22} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
              Batas Revisi Habis (Maksimal 1x {Number(submission.status.id) === 7 ? 'Pasca Survei' : 'Tahap Verifikasi'})
            </p>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed font-medium">
              Pengajuan ini telah mencapai batas maksimal revisi pada tahap ini. Jika masih terdapat dokumen yang tidak sesuai, Anda harus menolak pengajuan ini secara permanen.
            </p>
          </div>
        </div>
      ) : null}

      {/* Info Uploaded Indicators Below 35 */}
      {[2, 3, 4, 6, 7].includes(Number(submission.status.id)) && uploadedIndicatorsCount < 35 && (
        <div className="mb-6 flex items-start gap-3.5 bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 shadow-2xs animate-in fade-in slide-in-from-top-4 duration-500">
          <AlertTriangle size={22} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
              Dokumen Belum Mencapai Minimal 35 Indikator ({uploadedIndicatorsCount}/35 Indikator Terisi)
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed font-medium">
              Perusahaan baru mengunggah dokumen bukti pada {uploadedIndicatorsCount} indikator. Anda dapat menandai indikator dengan status <strong>Revisi</strong> dan mengembalikan pengajuan agar perusahaan dapat melengkapi berkas yang kurang.
            </p>
          </div>
        </div>
      )}

      {/* Warning Unverified Indicators */}
      {[2, 3, 4, 6, 7].includes(Number(submission.status.id)) && unverifiedCount > 0 && uploadedIndicatorsCount >= 35 && (
        <div className="mb-6 flex items-start gap-3.5 bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 shadow-2xs animate-in fade-in slide-in-from-top-4 duration-500">
          <AlertTriangle size={22} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
              Audit Belum Selesai ({unverifiedCount} Indikator Menunggu Penilaian)
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed font-medium">
              Sistem mengunci tombol keputusan akhir. Anda wajib memberikan status (Valid, Revisi, atau Invalid) untuk 100% indikator secara spesifik agar rekam jejak audit BECdex valid dan dapat dipertanggungjawabkan.
            </p>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Company Profile Box */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-extrabold shrink-0 shadow-2xs">
                <Building2 size={24} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase font-bold mb-1">
                  <ShieldCheck size={11} />
                  <span>{t.dash_admin_sub_id_case?.replace("#{id}", submission.id) || `Audit Case ID: #${submission.id}`}</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {submission.user?.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {submission.user?.email}
                </p>
              </div>
            </div>
            <StatusBadge status={submission.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t.dash_admin_sub_id_pic || "Penanggung Jawab (PIC)"}
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                <Briefcase size={14} className="text-blue-500" />
                <span>{submission.user?.company?.pic_name ?? "—"}</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {submission.user?.company?.pic_position ?? (t.dash_admin_sub_id_pic_staff || "Staff Perusahaan")}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t.dash_admin_sub_id_contact_proof || "Kontak & Bukti Terunggah"}
              </span>
              <div className="flex items-center gap-2 font-mono text-slate-700 dark:text-slate-200">
                <Mail size={14} className="text-blue-500" />
                <span className="truncate">{submission.user?.company?.pic_email ?? "—"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                <MdFolder className="w-4 h-4 text-blue-500" />
                <span>{submission.documents_uploaded ?? 0} {t.dash_admin_sub_id_doc_attached || "Dokumen Pendukung Terlampir"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auditor Score Summary Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              {t.dash_admin_sub_id_eval_summary || "Ringkasan Evaluasi Skor"}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-center">
                <ScoreGauge score={submission.initial_score ?? 0} label={t.dash_admin_sub_id_score_initial || "Skor Awal"} />
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-center">
                <ScoreGauge score={submission.valid_score ?? 0} label={t.dash_admin_sub_id_score_valid || "Skor Valid"} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {!isCertified ? (
              <>
                {/* cert button: hanya tampil untuk Super Admin & Certificate Admin */}
                {Number(submission.status.id) === 3 && (
                  <div className="flex w-full gap-2">
                    {submission.survey && canIssueCertificate(user) && (
                      <button
                        onClick={() => setShowCertModal(true)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] sm:text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        title="Langsung Terbitkan Sertifikat (Revisi Pasca Survei)"
                      >
                        <Award size={14} />
                        <span className="hidden sm:inline">{t.dash_admin_sub_id_btn_cert || "Terbitkan Sertifikat"}</span>
                      </button>
                    )}
                    {!submission.survey && canVerifySubmissions(user) && (
                      <button
                        onClick={() => approveMutation.mutate()}
                        disabled={approveMutation.isPending || unverifiedCount > 0}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-emerald-600/80 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold text-[10px] sm:text-xs transition-all cursor-pointer disabled:opacity-50"
                        title={unverifiedCount > 0 ? "Selesaikan penilaian semua indikator terlebih dahulu" : "Selesaikan & Luluskan"}
                      >
                        <CheckCircle2 size={14} />
                        <span className="hidden sm:inline">Luluskan</span>
                      </button>
                    )}
                    {(submission.revision_count ?? 0) >= 1 ? (
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={unverifiedCount > 0}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-600/80 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-600 hover:text-white font-bold text-[10px] sm:text-xs transition-all cursor-pointer disabled:opacity-50"
                        title={unverifiedCount > 0 ? "Selesaikan penilaian semua indikator terlebih dahulu" : "Tolak Permanen (Batas Revisi Habis)"}
                      >
                        <XCircle size={14} />
                        <span className="hidden sm:inline">Tolak Permanen</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowReturnModal(true)}
                        disabled={returnMutation.isPending || unverifiedCount > 0}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-500/80 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-500 hover:text-white font-bold text-[10px] sm:text-xs transition-all cursor-pointer disabled:opacity-50"
                        title={unverifiedCount > 0 ? "Selesaikan penilaian semua indikator terlebih dahulu" : "Kembalikan untuk Revisi"}
                      >
                        <AlertTriangle size={14} />
                        <span className="hidden sm:inline">{t.admin_sub_badge_revision || "Revisi"}</span>
                      </button>
                    )}
                  </div>
                )}
                {submission.status.id === 8 && (
                  <button
                    onClick={() => setShowSurveyModal(true)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-blue-600/80 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-bold text-xs transition-all cursor-pointer"
                  >
                    <MapPin size={14} />
                    <span>{t.dash_admin_sub_id_btn_survey || "Jadwal Survei"}</span>
                  </button>
                )}
                {submission.status.id === 7 && (
                  <div className="flex w-full gap-2">
                    {canIssueCertificate(user) && (
                      <button
                        onClick={() => setShowCertModal(true)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                      >
                        <Award size={14} />
                        <span>{t.dash_admin_sub_id_btn_cert || "Terbitkan Sertifikat"}</span>
                      </button>
                    )}
                    {(submission.revision_count ?? 0) >= 1 ? (
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={unverifiedCount > 0}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-600/80 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-600 hover:text-white font-bold text-[10px] sm:text-xs transition-all cursor-pointer disabled:opacity-50"
                        title={unverifiedCount > 0 ? "Selesaikan penilaian semua indikator terlebih dahulu" : "Tolak Permanen (Batas Revisi Habis)"}
                      >
                        <XCircle size={14} />
                        <span className="hidden sm:inline">Tolak Permanen</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowReturnModal(true)}
                        disabled={returnMutation.isPending || unverifiedCount > 0}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-500/80 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-500 hover:text-white font-bold text-[10px] sm:text-xs transition-all cursor-pointer disabled:opacity-50"
                        title={unverifiedCount > 0 ? "Selesaikan penilaian semua indikator terlebih dahulu" : "Kembalikan untuk Revisi Pasca Survei"}
                      >
                        <AlertTriangle size={14} />
                        <span className="hidden sm:inline">{t.admin_sub_badge_revision || "Revisi"}</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 py-3 rounded-xl flex items-center justify-center gap-1.5">
                <Award size={15} />
                <span>{t.dash_admin_sub_id_certified || "Sudah Tersertifikasi Resmi"}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('verification')} className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2", activeTab === 'verification' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
          <FileSearch size={16} /> {t.dash_admin_sub_id_tab_ver || "Lembar Verifikasi"}
        </button>
        <button onClick={() => setActiveTab('assessors')} className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2", activeTab === 'assessors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
          <Users size={16} /> {t.dash_admin_sub_id_tab_assessor || "Penugasan Asesor"}
        </button>
        {submission.status.id >= 6 && (
          <button onClick={() => setActiveTab('survey')} className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2", activeTab === 'survey' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
            <MapPin size={16} /> Log Kunjungan
          </button>
        )}
        <button onClick={() => setActiveTab('logs')} className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2", activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
          <Activity size={16} /> {t.dash_admin_sub_id_tab_logs || "Audit Trail"}
        </button>
      </div>

      {activeTab === 'verification' && (
        <>
          {/* Auditor Indicator Review Section */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
              {t.dash_admin_sub_id_worksheet_title || "Lembar Kerja Audit Per Indikator"}
            </h3>
            <p className="text-[11px] text-slate-400">
              {t.dash_admin_sub_id_worksheet_desc || "Periksa kelengkapan dokumen dan berikan keputusan verifikasi skor untuk setiap indikator"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowScoringGuide(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <Info size={14} />
              <span>Panduan Skoring</span>
            </button>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/80 dark:border-blue-800">
              {t.dash_admin_sub_id_total_aspect || "Total Aspek:"} {grouped.size}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {Array.from(grouped.entries()).map(([aspect, outcomeMap]) => (
            <div key={aspect} className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>{t.dash_admin_sub_id_aspect || "Aspek:"} {aspect}</span>
              </div>

            <div className="p-4 space-y-4">
                {Array.from(outcomeMap.entries()).map(([outcomeName, principleMap]) => (
                  <div key={outcomeName} className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 pt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{outcomeName}</span>
                    </div>

                    {Array.from(principleMap.entries()).map(([principleName, perIndicators]) => (
                      <div key={principleName} className="pl-2 space-y-2.5">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold px-1 flex items-center gap-1.5">
                          <span>&bull;</span>
                          <span>{t.dash_admin_sub_principle || "Prinsip"} {principleNumberMap.get(principleName)}: {principleName}</span>
                        </p>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                          {perIndicators!.map((pi: PerIndicatorItem) => {
                  const isExpanded = expandedIndicators.has(pi.indicator_id);
                  const docs = (submission.documents ?? []).filter(
                    (d) => (d as IndicatorDoc & { indicator_id: number }).indicator_id === pi.indicator_id
                  );
                  const isAssessmentDisabled = !isAdminEditable || indicatorMutation.isPending;

                  return (
                    <div key={pi.id} className="transition-colors">
                      <div className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <button
                          onClick={() => toggleIndicator(pi.indicator_id)}
                          className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-white text-left flex-1 min-w-0 cursor-pointer"
                        >
                          <span
                            className={cn(
                              "w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs",
                              pi.status.id === 4 ? "bg-emerald-500" :
                              pi.status.id === 5 ? "bg-rose-500" :
                              "bg-amber-400"
                            )}
                          />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="shrink-0 text-xs text-blue-600 dark:text-blue-400 font-extrabold font-mono bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800">
                              {t.dash_admin_sub_id_indicator || "Indikator"} {indicatorNumberMap.get(pi.indicator_id) ?? "—"}
                            </span>
                            <span className="truncate">{locale === 'id' ? (pi.indicator.name_id || pi.indicator.name) : pi.indicator.name}</span>
                            {(pi.indicator.description || pi.indicator.evidence || pi.indicator.regulation) && (
                              <span
                                role="button"
                                tabIndex={0}
                                title={t.dash_admin_sub_id_tooltip_detail || "Lihat Syarat & Bukti Indikator"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInfoModalIndicator({
                                    name: locale === 'id' ? (pi.indicator.name_id || pi.indicator.name) : pi.indicator.name,
                                    description: locale === 'en' ? (pi.indicator.description_en || pi.indicator.description) : (pi.indicator.description || pi.indicator.description_en),
                                    evidence: locale === 'en' ? (pi.indicator.evidence_en || pi.indicator.evidence) : (pi.indicator.evidence || pi.indicator.evidence_en),
                                    verification_method: locale === 'en' ? (pi.indicator.verification_method_en || pi.indicator.verification_method) : (pi.indicator.verification_method || pi.indicator.verification_method_en),
                                    regulation: locale === 'en' ? (pi.indicator.regulation_en || pi.indicator.regulation) : (pi.indicator.regulation || pi.indicator.regulation_en),
                                  });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.stopPropagation();
                                    setInfoModalIndicator({
                                      name: locale === 'id' ? (pi.indicator.name_id || pi.indicator.name) : pi.indicator.name,
                                      description: locale === 'en' ? (pi.indicator.description_en || pi.indicator.description) : (pi.indicator.description || pi.indicator.description_en),
                                      evidence: locale === 'en' ? (pi.indicator.evidence_en || pi.indicator.evidence) : (pi.indicator.evidence || pi.indicator.evidence_en),
                                      verification_method: locale === 'en' ? (pi.indicator.verification_method_en || pi.indicator.verification_method) : (pi.indicator.verification_method || pi.indicator.verification_method_en),
                                      regulation: locale === 'en' ? (pi.indicator.regulation_en || pi.indicator.regulation) : (pi.indicator.regulation || pi.indicator.regulation_en),
                                    });
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                              >
                                <Info size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                                  {t.indicator_detail_btn || "Detail Syarat"}
                                </span>
                              </span>
                            )}
                          </div>
                          {/* Badge Perlu Dicek Ulang */}
                          {(pi.status.id === 5 || (pi.status.id === 2 && pi.comment)) && (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-800">
                              <AlertTriangle size={9} />
                              {t.dash_admin_sub_id_revision_needed || "Perlu Dicek Ulang"}
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronDown size={16} className="shrink-0 text-slate-400" />
                          ) : (
                            <ChevronRight size={16} className="shrink-0 text-slate-400" />
                          )}
                        </button>

                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <button
                            onClick={() =>
                              indicatorMutation.mutate({
                                indicatorId: pi.indicator_id,
                                statusId: 4,
                                valid_values: pi.indicator.questions.map((q: { id: number }) => ({
                                  question_id: q.id,
                                  valid_value: 2,
                                })),
                              })
                            }
                            disabled={isAssessmentDisabled}
                            title={t.dash_admin_sub_id_tooltip_valid || "Setuju & Verifikasi"}
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs transition-all border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                              pi.status.id === 4
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            )}
                          >
                            <CheckCircle2 size={13} />
                            <span>{t.dash_admin_sub_id_btn_valid || "Valid"}</span>
                          </button>
                          {(submission.revision_count === 0) ? (
                            <button
                              onClick={() =>
                                indicatorMutation.mutate({
                                  indicatorId: pi.indicator_id,
                                  statusId: 5,
                                  valid_values: pi.indicator.questions.map((q: { id: number }) => ({
                                    question_id: q.id,
                                    valid_value: 0,
                                  })),
                                })
                              }
                              disabled={isAssessmentDisabled}
                              title={t.dash_admin_sub_id_tooltip_revise || "Minta perusahaan merevisi dokumen"}
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs transition-all border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                                pi.status.id === 5
                                  ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20"
                                  : "bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-600 hover:text-white dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                              )}
                            >
                              <XCircle size={13} />
                              <span>{t.dash_admin_sub_id_btn_revise || "Revisi"}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                indicatorMutation.mutate({
                                  indicatorId: pi.indicator_id,
                                  statusId: 6,
                                  valid_values: pi.indicator.questions.map((q: { id: number }) => ({
                                    question_id: q.id,
                                    valid_value: 0,
                                  })),
                                })
                              }
                              disabled={isAssessmentDisabled}
                              title="Tolak permanen / Gagal (Invalid)"
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs transition-all border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                                pi.status.id === 6
                                  ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                                  : "bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-600 hover:text-white dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                              )}
                            >
                              <XCircle size={13} />
                              <span>Invalid</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-slate-800 p-5 space-y-5 animate-in fade-in duration-150">

                          {/* Documents List */}
                          <div>
                            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              {t.dash_admin_sub_id_doc_title || "Bukti Dokumen Terlampir"} ({docs.length})
                            </span>
                            {docs.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">{t.dash_admin_sub_id_doc_empty || "Perusahaan belum mengunggah dokumen pada indikator ini."}</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {docs.map((doc) => (
                                  <a
                                    key={doc.id}
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 transition-all group"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                                        <FileText size={15} />
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 block">
                                          {doc.original_name}
                                        </span>
                                        <span className={[
                                          "inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5",
                                          doc.upload_phase === 3
                                            ? "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400"
                                            : doc.upload_phase === 2
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                                        ].join(" ")}>
                                          {doc.upload_phase === 3
                                            ? "Fase 3 · Revisi Survei"
                                            : doc.upload_phase === 2
                                            ? "Fase 2 · Revisi Verifikasi"
                                            : "Fase 1 · Pengajuan Awal"}
                                        </span>
                                      </div>
                                    </div>
                                    <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Verification Questions List */}
                          <div>
                            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              {t.dash_admin_sub_id_ver_label || "Verifikasi Bobot Jawaban Kuesioner"}
                            </span>
                            <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                              {pi.indicator.questions.map((q: IndicatorQuestion) => {
                                const answer = submission.answers?.find(
                                  (a: AnswerItem) => a.question_id === q.id
                                );

                                return (
                                  <div
                                    key={q.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p 
                                        className="text-slate-800 dark:text-slate-200 font-semibold leading-snug whitespace-pre-line"
                                        dangerouslySetInnerHTML={{ __html: (locale === 'en' ? (q.text_en || q.text) : (q.text || q.text_en)) ?? "" }}
                                      />
                                      <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                                        <span className="text-slate-400">{t.dash_admin_sub_id_claim_label || "Klaim Pengaju:"}</span>
                                        <span
                                          className={cn(
                                            "font-bold px-2 py-0.5 rounded-md text-xs",
                                            (Number(answer?.value) ?? 0) > 0
                                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800"
                                              : Number(answer?.value) === 0
                                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800"
                                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                          )}
                                        >
                                          {(Number(answer?.value) ?? 0) > 0
                                            ? (t.dash_admin_sub_id_claim_yes?.replace("{value}", String(answer?.value)) || `Ya (Skor: ${answer?.value})`)
                                            : Number(answer?.value) === 0
                                            ? (t.dash_admin_sub_id_claim_no || "Tidak")
                                            : "—"}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {t.dash_admin_sub_id_decision_label || "Keputusan Skor:"}
                                      </label>
                                      <select
                                        value={answer?.valid_value ?? ""}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                                          indicatorMutation.mutate({
                                            indicatorId: pi.indicator_id,
                                            statusId: val === 0 ? 5 : 4,
                                            valid_values: [{ question_id: q.id, valid_value: val }],
                                          });
                                        }}
                                        className="px-3 py-1.5 text-xs border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl focus:outline-hidden focus:border-blue-500 font-bold cursor-pointer transition-all shadow-2xs"
                                      >
                                        <option value="">{t.dash_admin_sub_id_score_select || "-- Set Skor --"}</option>
                                        <option value="0">{t.dash_admin_sub_id_score_0 || "0 (Ditolak)"}</option>
                                        <option value="0.5">0.5</option>
                                        <option value="1">1.0</option>
                                        <option value="2">2.0</option>
                                      </select>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Auditor Comment / Chat Section (Moved to bottom) */}
                          <div className="pt-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                              <MessageSquare size={14} className="text-blue-500" />
                              Diskusi & Catatan Asesor
                            </label>
                            <IndicatorChat submissionId={id as string} indicatorId={pi.indicator_id} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
))}
        </div>
      </div>
      </>
      )}

      {activeTab === 'assessors' && <AssessorTab submissionId={id} />}
      {activeTab === 'survey' && <FieldSurveyTab submissionId={id} />}
      {activeTab === 'logs' && <ActivityLogTab submissionId={id} />}

      {/* Return Revision Confirmation Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !returnMutation.isPending && setShowReturnModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-rose-900/20 border border-slate-200/50 dark:border-slate-700/50 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-100 dark:border-rose-900/50">
                <AlertTriangle className="text-rose-600 dark:text-rose-400" size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">{t.admin_sub_modal_confirm_return || "Konfirmasi Pengembalian"}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                {t.dash_admin_sub_id_return_confirm || "Kembalikan dokumen ini ke perusahaan untuk direvisi? Pastikan Anda telah menandai indikator yang bermasalah dengan status 'Revisi'."}
              </p>

              <div className="mb-6 text-left">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan Pengembalian <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden transition-all resize-none"
                  rows={3}
                  placeholder="Jelaskan dokumen mana yang perlu diperbaiki dan alasannya..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReturnModal(false)}
                  disabled={returnMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {t.dash_admin_sub_id_btn_cancel || "Batal"}
                </button>
                <button
                  onClick={() => returnMutation.mutate()}
                  disabled={returnMutation.isPending || !returnReason.trim()}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {returnMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Ya, Kembalikan"}
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => !returnMutation.isPending && setShowReturnModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !rejectMutation.isPending && setShowRejectModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-rose-900/20 border border-slate-200/50 dark:border-slate-700/50 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-100 dark:border-rose-900/50">
                <XCircle className="text-rose-600 dark:text-rose-400" size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">{t.admin_sub_btn_reject_perm || "Tolak Permanen"}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Pengajuan akan dikunci secara permanen. Mohon sertakan alasan penolakan.
              </p>
              
              <div className="mb-6 text-left">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan Penolakan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-rose-500 outline-hidden transition-all resize-none"
                  rows={3}
                  placeholder="Ketikkan alasan spesifik..."
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={rejectMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {rejectMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Tolak"}
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => !rejectMutation.isPending && setShowRejectModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* Survey Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Calendar size={18} />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.dash_admin_sub_id_surv_title || "Jadwalkan Survei Lokasi"}</h3>
              </div>
              <button onClick={() => setShowSurveyModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.dash_admin_sub_id_surv_date || "Tanggal & Waktu Kunjungan"}</label>
                <input
                  type="datetime-local"
                  value={surveyForm.scheduled_at}
                  onChange={(e) => setSurveyForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-white font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.dash_admin_sub_id_surv_link || "Link Lokasi (Google Maps / URL)"}</label>
                <input
                  type="url"
                  value={surveyForm.location_link}
                  onChange={(e) => setSurveyForm((p) => ({ ...p, location_link: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-white font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.dash_admin_sub_id_surv_notes || "Catatan Instruksi untuk PIC"}</label>
                <textarea
                  value={surveyForm.notes}
                  onChange={(e) => setSurveyForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  placeholder={t.dash_admin_sub_id_surv_notes_placeholder || "Harap persiapkan dokumen asli fisik saat kunjungan lapangan..."}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-white font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSurveyModal(false)}
                type="button"
                className="px-4 py-2.5 border border-slate-200/80 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs"
              >
                {t.dash_admin_sub_id_btn_cancel || "Batal"}
              </button>
              <button
                onClick={() => surveyMutation.mutate()}
                disabled={surveyMutation.isPending}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/15 disabled:opacity-60 transition-all cursor-pointer text-xs"
              >
                {surveyMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                <span>{t.dash_admin_sub_id_btn_save_surv || "Simpan Jadwal Survei"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Award size={18} />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.dash_admin_sub_id_cert_title || "Terbitkan Sertifikat Resmi"}</h3>
              </div>
              <button onClick={() => setShowCertModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.dash_admin_sub_id_cert_cat || "Kategori Peringkat BECdex"}</label>
                <select
                  value={certForm.becdex_category_id}
                  onChange={(e) => {
                    const catId = e.target.value;
                    const certId = catId === "2" ? "12" : catId === "3" ? "10" : "11";
                    setCertForm((p) => ({ ...p, becdex_category_id: catId, certificate_id: certId }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-white font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs cursor-pointer"
                >
                  <option value="2">Standard Blue Economy Company</option>
                  <option value="3">Good Blue Economy Company</option>
                  <option value="4">Excellent Blue Economy Company</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.dash_admin_sub_id_cert_date || "Tanggal Penerbitan"}</label>
                <input
                  type="date"
                  value={certForm.published_at}
                  onChange={(e) => setCertForm((p) => ({ ...p, published_at: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-white font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.dash_admin_sub_id_cert_mmic || "Nomor Registrasi MMIC"}</label>
                <input
                  type="text"
                  value={certForm.mmic}
                  onChange={(e) => setCertForm((p) => ({ ...p, mmic: e.target.value }))}
                  placeholder="Contoh: MMIC-2026-BEC-001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.dash_admin_sub_id_cert_director || "Nama Direktur / Pejabat Penandatangan"}</label>
                <input
                  type="text"
                  value={certForm.direktur}
                  onChange={(e) => setCertForm((p) => ({ ...p, direktur: e.target.value }))}
                  placeholder="Contoh: Dr. Ir. H. Halim Akbar, M.Sc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-white font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowCertModal(false)}
                type="button"
                className="px-4 py-2.5 border border-slate-200/80 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs"
              >
                {t.dash_admin_sub_id_btn_cancel || "Batal"}
              </button>
              <button
                onClick={() => certMutation.mutate()}
                disabled={certMutation.isPending}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 disabled:opacity-60 transition-all cursor-pointer text-xs"
              >
                {certMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                <span>{t.dash_admin_sub_id_btn_save_cert || "Terbitkan Sertifikat Sekarang"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Guide Modal */}
      {showScoringGuide && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowScoringGuide(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 md:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Panduan Skoring
                </h3>
              </div>
              <button
                onClick={() => setShowScoringGuide(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-extrabold text-slate-700 dark:text-slate-300 shrink-0">0</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Tidak Ada Bukti</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Tidak ada komitmen tertulis, kebijakan, SOP, maupun bukti implementasi sama sekali.</p>
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center font-extrabold text-amber-700 dark:text-amber-400 shrink-0">0.5</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Ada Komitmen</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Terdapat bukti berupa komitmen, kebijakan, atau SOP tertulis, namun belum terbukti diimplementasikan di lapangan.</p>
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center font-extrabold text-blue-700 dark:text-blue-400 shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Implementasi Sebagian</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Kebijakan sudah mulai diimplementasikan sebagian, namun bukti lapangan/rekam jejak belum komprehensif.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Implementasi Penuh</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Implementasi penuh secara menyeluruh. Dibuktikan dengan data pendukung yang valid, terukur, dapat dilacak, dan konsisten.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal — Audit Checklist Detail (Replicated from User View) */}
      {infoModalIndicator && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setInfoModalIndicator(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-800/30">
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Info size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    {infoModalIndicator.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5 uppercase tracking-wider">
                    {t.assessment_modal_title || "Syarat & Bukti Indikator"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInfoModalIndicator(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
              {/* Description */}
              {infoModalIndicator.description && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <BookOpen size={11} /> {t.assessment_modal_desc || "Deskripsi Indikator"}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {infoModalIndicator.description}
                  </p>
                </div>
              )}

              {/* Evidence */}
              {infoModalIndicator.evidence && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <FileText size={11} /> {t.assessment_modal_evidence || "Bukti yang Diperlukan"}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {infoModalIndicator.evidence}
                  </p>
                </div>
              )}

              {/* Verification Method */}
              {infoModalIndicator.verification_method && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 size={11} /> {t.assessment_modal_verification || "Metode Verifikasi"}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {infoModalIndicator.verification_method}
                  </p>
                </div>
              )}

              {/* Regulation */}
              {infoModalIndicator.regulation && (
                <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
                  <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Scale size={11} /> {t.assessment_modal_regulation || "Dasar Hukum & Regulasi"}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {infoModalIndicator.regulation}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t.assessment_modal_footer_text || "Siapkan semua dokumen sebelum mengupload"}
              </p>
              <button
                onClick={() => setInfoModalIndicator(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer text-sm"
              >
                {t.assessment_modal_btn_understand || "Mengerti"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
                Hapus Pengajuan Permanen?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Tindakan ini tidak dapat dibatalkan. Semua data terkait pengajuan ini (dokumen, penilaian, history) akan dihapus secara permanen dari sistem.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 disabled:opacity-60 transition-all text-sm"
                >
                  {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  <span>Ya, Hapus Permanen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
