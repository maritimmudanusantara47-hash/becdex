"use client";

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from "recharts";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Clock,
  SendHorizonal,
  Award,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { SubmissionDetail, ScoreData, PaymentTransaction } from "@/types";
import { ScoreGauge } from "@/components/ui/index";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/store/lang";

type ApiError = { response?: { data?: { message?: string } } };

interface Props {
  submission: SubmissionDetail;
  onUpdate: () => void;
}

export function ScorePaymentTab({ submission, onUpdate }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: scoreData, isLoading } = useQuery<{ data: ScoreData }>({
    queryKey: ["score", submission.id],
    queryFn: async () => {
      const res = await api.get(`/submissions/${submission.id}/score`);
      return res.data;
    },
  });

  const score = scoreData?.data;

  // ── Initiate payment ───────────────────────────────────────────────────────
  const payMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/submissions/${submission.id}/payment`);
      return res.data as { message: string; data: PaymentTransaction };
    },
    onSuccess: (data) => {
      const { invoice_url } = data.data;

      if (invoice_url) {
        toast.success("Invoice berhasil dibuat! Anda akan diarahkan ke halaman pembayaran Xendit.", {
          duration: 4000,
        });

        // Buka halaman Xendit di tab baru
        window.open(invoice_url, "_blank", "noopener,noreferrer");

        // Invalidate score query so requirements refresh after returning
        queryClient.invalidateQueries({ queryKey: ["score", submission.id] });
      } else {
        toast.info("Invoice sedang diproses. Silakan refresh halaman jika sudah membayar.");
      }
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || "Gagal menginisiasi pembayaran.");
    },
  });

  // ── Bug #7 Fix: Refresh status actually calls backend to check Xendit payment status ──
  const refreshMutation = useMutation({
    mutationFn: async () => {
      // Call real endpoint that polls Xendit API and updates DB if paid
      const res = await api.get(`/submissions/${submission.id}/payment/check`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate both score and submission queries
      queryClient.invalidateQueries({ queryKey: ["score", submission.id] });
      queryClient.invalidateQueries({ queryKey: ["submission", submission.id] });
      onUpdate();
      toast.success("Status pembayaran telah diperbarui.");
    },
    onError: () => {
      // If endpoint not available, fallback to invalidating cache
      queryClient.invalidateQueries({ queryKey: ["score", submission.id] });
      onUpdate();
      toast.info("Memuat ulang status...");
    },
  });

  // ── Submit (pertama kali bayar) ATAU kirim ulang revisi pasca survei ──────
  const submitVerificationMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/submissions/${submission.id}/submit`);
      return res.data;
    },
    onSuccess: (data) => {
      const msg = (data as { message?: string })?.message ?? "";
      const isFreeRevision = msg.toLowerCase().includes("revisi") && !msg.toLowerCase().includes("pembayaran");
      
      if (isFreeRevision) {
        toast.success("Revisi berhasil dikirim! Admin akan meninjau ulang dokumen yang direvisi.");
      } else {
        toast.success("Pengajuan berhasil dikunci! Membuat invoice pembayaran Xendit...");
        // Auto trigger payment creation so user is redirected to Xendit right away
        payMutation.mutate();
      }
      queryClient.invalidateQueries({ queryKey: ["submission", submission.id] });
      queryClient.invalidateQueries({ queryKey: ["score", submission.id] });
      onUpdate();
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || "Gagal mengirim pengajuan.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={28} />
      </div>
    );
  }

  if (!score) return null;

  const canPay = score.can_proceed_to_payment;

  // Status-based UI flags
  const isDraftOrRevision  = [2, 4].includes(submission.status.id); // User still filling
  const isPendingPayment   = submission.status.id === 1;             // Submitted, waiting for payment
  const isOnVerification   = submission.status.id === 3;             // Paid, admin verifying
  const isSurvey           = submission.status.id === 7;             // Survey stage
  const isCertified        = submission.status.id === 5;             // Certified
  const isRejectedPermanently = submission.status.id === 9;          // Rejected Permanently

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* === STATUS 9: Rejected Permanently === */}
      {isRejectedPermanently && (
        <div className="flex items-start gap-3.5 bg-rose-50/80 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-5 shadow-2xs">
          <AlertCircle size={22} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
              Sertifikasi Ditolak Permanen
            </p>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed font-medium">
              Mohon maaf, pengajuan Anda telah ditolak secara permanen setelah mencapai batas maksimal revisi. Tidak ada pengembalian dana (*refund*). Anda harus membuat pengajuan sertifikasi baru melalui Dashboard.
            </p>
          </div>
        </div>
      )}
      {/* === STATUS 2/4: Draft ATAU Revisi — User masih mengisi/merevisi === */}
      {isDraftOrRevision && (
        <div className="space-y-4">
          <div className="flex items-start gap-3.5 bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-5 shadow-2xs">
            <SendHorizonal size={22} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-extrabold text-[#0c2340] dark:text-white">
                {submission.is_post_survey_revision && submission.requires_payment
                  ? "Simpan & Lanjut ke Pembayaran Survei"
                  : !submission.requires_payment
                  ? "Kirim Ulang Hasil Revisi ke Admin"
                  : "Simpan & Lanjutkan ke Pembayaran"}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                {submission.is_post_survey_revision && submission.requires_payment
                  ? "Anda telah menyelesaikan perbaikan dokumen pasca survei lapangan. Klik tombol di bawah untuk menyimpan pengajuan dan melanjutkan ke pembayaran biaya survei lokasi via Xendit."
                  : !submission.requires_payment
                  ? "Anda telah menyelesaikan perbaikan kuesioner & dokumen pendukung. Klik tombol di bawah untuk mengirimkan ulang hasil revisi Anda ke tim auditor untuk ditinjau kembali (Gratis / Tidak ada biaya pembayaran ulang)."
                  : "Jika Anda sudah melengkapi kuesioner dan dokumen, klik tombol di bawah untuk menyimpan pengajuan. Anda akan diarahkan ke tahap pembayaran biaya sertifikasi."}
              </p>
            </div>
          </div>

          <button
            id="btn-submit-verification"
            onClick={() => submitVerificationMutation.mutate()}
            disabled={submitVerificationMutation.isPending || !score.requirements.score_met || !score.requirements.documents_met}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-extrabold text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
              !submission.requires_payment
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                : "bg-[#0c2340] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-[#0c2340]/20"
            )}
          >
            {submitVerificationMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <SendHorizonal size={18} />
            )}
            <span>
              {submitVerificationMutation.isPending
                ? "Memproses pengajuan..."
                : submission.is_post_survey_revision && submission.requires_payment
                ? "Simpan & Lanjut ke Pembayaran Survei"
                : !submission.requires_payment
                ? "Kirim Ulang Hasil Revisi ke Admin (Gratis)"
                : "Simpan & Lanjut ke Pembayaran"}
            </span>
          </button>
        </div>
      )}

      {/* TailAdmin Score Cards Wrapper */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Award size={18} className="text-blue-600 dark:text-blue-400" />
          <h4 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base tracking-tight">
            Metrik Penilaian & Poin Kelayakan
          </h4>
        </div>

        <ScoreGauge
          score={score.initial_score}
          label="Skor Awal Kuesioner (Self-Assessment)"
        />
        <ScoreGauge
          score={score.valid_score}
          label="Skor Validasi Resmi (Verified by Admin)"
        />

        {submission.radar_data && submission.radar_data.length > 0 && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-slate-800 dark:text-white text-sm text-center mb-4">
              Analisis Skor per Aspek (Spider Chart)
            </h4>
            <div className="h-87.5 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={submission.radar_data}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Skor Mandiri" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Radar name="Skor Validasi" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Requirements Card */}
      <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <FileCheck size={16} className="text-blue-600 dark:text-blue-400" />
            <span>{t.tab_payment_req || "Persyaratan Kelayakan Lanjut ke Pembayaran"}</span>
          </p>
          <span
            className={cn(
              "text-[11px] font-bold px-2.5 py-1 rounded-full border",
              score.can_proceed_to_payment
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
            )}
          >
            {score.can_proceed_to_payment ? "Siap Dibayar" : "Persyaratan Belum Lengkap"}
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              {score.requirements.score_met ? (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
              )}
              <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200">
                Ambang Batas Skor Mandiri (&ge; {score.requirements.min_initial_score}%)
              </span>
            </div>
            <span
              className={cn(
                "font-mono text-xs font-bold px-2 py-0.5 rounded-md",
                score.requirements.score_met
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
              )}
            >
              {score.initial_score.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              {score.requirements.documents_met ? (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
              )}
              <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t.score_req_documents} (&ge; {score.requirements.min_documents} Indikator)
              </span>
            </div>
            <span
              className={cn(
                "font-mono text-xs font-bold px-2 py-0.5 rounded-md",
                score.requirements.documents_met
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
              )}
            >
              {score.documents_uploaded} / {score.requirements.min_documents}
            </span>
          </div>
        </div>
      </div>

      {/* === STATUS 1: Pending Payment — Menunggu pembayaran user === */}
      {isPendingPayment && (
        <div className="flex items-start gap-3.5 bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 shadow-2xs">
          <Clock size={22} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
              Pengajuan Disimpan — Menunggu Pembayaran
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed font-medium">
              {submission.is_post_survey_revision
                ? "Pengajuan revisi pasca survei sudah disimpan. Silakan selesaikan pembayaran biaya survei lokasi di bawah untuk melanjutkan."
                : "Pengajuan Anda sudah disimpan. Selesaikan pembayaran biaya sertifikasi di bawah untuk melanjutkan ke tahap verifikasi oleh Admin."}
            </p>
          </div>
        </div>
      )}

      {/* === STATUS 3: Admin sedang memverifikasi (setelah bayar) === */}
      {isOnVerification && (
        <div className="flex items-start gap-3.5 bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-5 shadow-2xs">
          <ShieldCheck size={22} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-[#0c2340] dark:text-white">
              Pembayaran Dikonfirmasi — Dalam Proses Verifikasi Admin
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
              Pembayaran Anda telah kami terima. Seluruh berkas dokumen sedang diperiksa oleh tim penilai admin. Status akan diperbarui secara real-time. Pantau terus notifikasi Anda.
            </p>
          </div>
        </div>
      )}

      {/* === Payment Section — muncul ketika status 1 (Pending Payment) === */}
      {isPendingPayment && canPay && (
        <div className="space-y-4">
          {/* Xendit Info Banner */}
          <div className="flex items-start gap-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 rounded-2xl p-4 shadow-xs">
            <CreditCard size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Pembayaran diproses secara aman & otomatis via gerbang pembayaran resmi <strong className="text-[#0c2340] dark:text-white font-extrabold">Xendit</strong>. Mendukung Transfer Bank Virtual Account (BCA, BNI, BRI, Mandiri), E-Wallet (OVO, DANA, GoPay, ShopeePay), Kartu Kredit Internasional, dan metode regional Asia Tenggara.
            </p>
          </div>

          {/* Pay Button */}
          <button
            id="btn-pay-xendit"
            onClick={() => payMutation.mutate()}
            disabled={!canPay || payMutation.isPending}
            className="w-full flex items-center justify-center gap-2.5 bg-[#0c2340] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-4 rounded-xl font-extrabold text-sm transition-all shadow-md shadow-[#0c2340]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {payMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ExternalLink size={18} />
            )}
            <span>
              {payMutation.isPending
                ? "Membuat Invoice Pembayaran Xendit..."
                : submission.is_post_survey_revision
                ? "Bayar Biaya Survei Sekarang via Xendit"
                : "Bayar Biaya Sertifikasi Sekarang via Xendit"}
            </span>
          </button>

          {/* Refresh Status Check */}
          <button
            id="btn-refresh-payment-status"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="w-full flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 py-3 rounded-xl text-xs md:text-sm font-bold transition-all shadow-2xs cursor-pointer"
          >
            {refreshMutation.isPending ? (
              <Loader2 size={15} className="animate-spin text-blue-600" />
            ) : (
              <RefreshCw size={15} className="text-blue-600 dark:text-blue-400" />
            )}
            <span>{t.tab_payment_check || "Sudah Membayar? Cek & Mutakhirkan Status Pembayaran"}</span>
          </button>

          {/* Pending Info */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium pt-1">
            <Clock size={13} />
            <span>Invoice pembayaran aktif dan berlaku selama 24 jam sejak dibuat.</span>
          </div>
        </div>
      )}

      {/* === Sudah bayar, bukan status 1 (Pending Payment) === */}
      {!isPendingPayment && !isDraftOrRevision && !isOnVerification && !isSurvey && !isCertified && !isRejectedPermanently && (
        <div className="flex items-start gap-3.5 bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-5 shadow-2xs">
          <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
              Pembayaran Berhasil Dikonfirmasi
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed font-medium">
              Pembayaran Anda telah diterima. Tim kami akan segera memverifikasi dokumen dan mengatur jadwal survei lapangan ke perusahaan Anda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
