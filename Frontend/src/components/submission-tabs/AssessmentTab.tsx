"use client";

import { useState, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Upload,
  Trash2,
  FileText,
  AlertTriangle,
  MessageSquare,
  Info,
  X,
  BookOpen,
  Scale,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { MdCheckCircle, MdSearch, MdWarning } from "react-icons/md";
import { SubmissionDetail, PerIndicator } from "@/types";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { IndicatorChat } from "./IndicatorChat";
import { useTranslation } from "@/store/lang";

const ENABLE_SCORE_SELECTION = false;

interface Props {
  submission: SubmissionDetail;
  onUpdate: () => void;
  onGoToScore?: () => void;
}

// Group per_indicators by aspect → outcome → principle
function groupByAspect(perIndicators: PerIndicator[]) {
  const aspectMap = new Map<string, Map<string, Map<string, PerIndicator[]>>>();

  for (const pi of perIndicators) {
    const aspect = pi.indicator.principle.outcome.aspect.name;
    const outcome = pi.indicator.principle.outcome.name;
    const principle = pi.indicator.principle.name;

    if (!aspectMap.has(aspect)) aspectMap.set(aspect, new Map());
    const outcomeMap = aspectMap.get(aspect)!;
    if (!outcomeMap.has(outcome)) outcomeMap.set(outcome, new Map());
    const principleMap = outcomeMap.get(outcome)!;
    if (!principleMap.has(principle)) principleMap.set(principle, []);
    principleMap.get(principle)!.push(pi);
  }
  return aspectMap;
}

function DocumentUploadZone({
  submissionId,
  indicatorId,
  indicatorName,
  onSuccess,
}: {
  submissionId: string;
  indicatorId: number;
  indicatorName: string;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      form.append("indicator_id", String(indicatorId));
      await api.post(`/submissions/${submissionId}/documents`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success(`Dokumen untuk ${indicatorName} berhasil diupload!`);
      onSuccess();
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message || "Upload gagal.");
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        mutation.mutate(acceptedFiles[0]);
      }
    },
    [mutation],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 mt-3",
        isDragActive
          ? "border-blue-500 bg-blue-50/50"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
      )}>
      <input {...getInputProps()} />
      {mutation.isPending ? (
        <div className="flex items-center justify-center gap-2 text-blue-500">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm font-semibold">
            {t.tab_assessment_uploading || "Mengunggah berkas..."}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-slate-400">
          <Upload size={18} className="text-slate-300" />
          <span className="text-xs font-semibold text-slate-500">
            {isDragActive
              ? "Lepas file di sini..."
              : "Klik atau seret dokumen pendukung di sini"}
          </span>
          <span className="text-[10px] text-slate-400">
            {t.tab_assessment_format || "Format PDF/JPG/PNG (maks. 10MB)"}
          </span>
        </div>
      )}
    </div>
  );
}

export function AssessmentTab({ submission, onUpdate, onGoToScore }: Props) {
  const { t, locale } = useTranslation();
  // Only Indonesian companies have access to local Legal Basis & Regulation data
  const countryString = submission.user?.company?.country?.toLowerCase() ?? "";
  const isIndonesianCompany = ["id", "idn", "indonesia"].includes(countryString);
  // Jawaban yang sudah tersimpan di server (nilai numerik: 0, 0.5, 1, 2)
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    for (const answer of submission.answers) {
      if (answer.value !== null && answer.value !== undefined) {
        initial[answer.question_id] = Number(answer.value);
      }
    }
    return initial;
  });

  // Bug #1 & #2 Fix: Track questions where user clicked "Ya" but hasn't selected a score yet
  // This prevents double-save and distinguishes "pending yes" from "has score"
  const [pendingYes, setPendingYes] = useState<Set<number>>(new Set());

  const [expandedAspects, setExpandedAspects] = useState<Set<string>>(
    new Set(),
  );
  const [expandedIndicators, setExpandedIndicators] = useState<Set<number>>(
    new Set(),
  );
  const [infoModalIndicator, setInfoModalIndicator] = useState<{
    name: string;
    description: string | null;
    evidence: string | null;
    verification_method: string | null;
    regulation: string | null;
  } | null>(null);
  const [showScoringGuide, setShowScoringGuide] = useState(false);

  const grouped = useMemo(
    () => groupByAspect(submission.per_indicators ?? []),
    [submission.per_indicators],
  );

  // Build sequential number map (indicator_id → number 1..N) preserving aspect grouping order
  const indicatorNumberMap = useMemo(() => {
    const map = new Map<number, number>();
    let counter = 0;
    for (const outcomeMap of grouped.values()) {
      for (const principleMap of outcomeMap.values()) {
        for (const pis of principleMap.values()) {
          for (const pi of pis) {
            map.set(pi.indicator_id, ++counter);
          }
        }
      }
    }
    return map;
  }, [grouped]);

  // Build sequential number map for Principles
  const principleNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    let counter = 0;
    for (const outcomeMap of grouped.values()) {
      for (const principleMap of outcomeMap.values()) {
        for (const principleName of principleMap.keys()) {
          if (!map.has(principleName)) {
            map.set(principleName, ++counter);
          }
        }
      }
    }
    return map;
  }, [grouped]);

  // Fix Bug #1: Mutation sends actual numeric value (not boolean)
  const saveSingleAnswerMutation = useMutation({
    mutationFn: async ({
      questionId,
      value,
    }: {
      questionId: number;
      value: number;
    }) => {
      await api.put(`/submissions/${submission.id}/answers`, {
        answers: [{ question_id: questionId, value: value }], // Numeric: 0, 0.5, 1, or 2
      });
    },
    onSuccess: () => {
      onUpdate();
    },
    onError: () => {
      toast.error("Gagal menyimpan jawaban.");
    },
  });

  // Fix Bug #2: Clicking "Ya" only marks local pendingYes state, does NOT save to API
  const handleYesClick = (questionId: number) => {
    // If already answered with a real score (> 0), no-op (already "Yes")
    if ((answers[questionId] ?? 0) > 0) return;

    if (ENABLE_SCORE_SELECTION) {
      setPendingYes((prev) => new Set([...prev, questionId]));
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: 2 }));
      saveSingleAnswerMutation.mutate({ questionId, value: 2 });
    }
  };

  // Fix Bug #3: Warn user if they answer "Tidak" when indicator has documents
  const handleNoClick = (
    questionId: number,
    pi: PerIndicator,
    uploadedDocsByIndicator: Map<number, typeof submission.documents>,
  ) => {
    const docsForIndicator = uploadedDocsByIndicator.get(pi.indicator_id) ?? [];

    if (docsForIndicator.length > 0) {
      // Check if this is the last "Ya" question for this indicator
      const hasOtherYesInIndicator = pi.indicator.questions
        .filter((q) => q.id !== questionId)
        .some((q) => pendingYes.has(q.id) || (answers[q.id] ?? 0) > 0);

      if (!hasOtherYesInIndicator) {
        const confirmed = window.confirm(
          `Perhatian!\n\nAnda sudah mengupload ${docsForIndicator.length} dokumen untuk indikator "${pi.indicator.name}".\n\nJika Anda menjawab "Tidak", dokumen tersebut tidak akan otomatis terhapus. Anda perlu menghapusnya secara manual di tab Dokumen.\n\nLanjutkan?`,
        );
        if (!confirmed) return;
      }
    }

    if (ENABLE_SCORE_SELECTION) {
      // Remove from pendingYes
      setPendingYes((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }

    // Update local state and save to API
    setAnswers((prev) => ({ ...prev, [questionId]: 0 }));
    saveSingleAnswerMutation.mutate({ questionId, value: 0 });
  };

  // Fix Bug #1: Score selection saves the actual numeric score to API
  const handleScoreSelect = (questionId: number, value: number) => {
    // Remove from pendingYes now that a score is selected
    setPendingYes((prev) => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
    // Save actual numeric value
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    saveSingleAnswerMutation.mutate({ questionId, value });
  };

  const deleteMutation = useMutation({
    mutationFn: async (docId: number) => {
      await api.delete(`/submissions/${submission.id}/documents/${docId}`);
    },
    onSuccess: () => {
      toast.success("Dokumen berhasil dihapus.");
      onUpdate();
    },
    onError: () => {
      toast.error("Gagal menghapus dokumen.");
    },
  });

  const uploadedDocsByIndicator = useMemo(() => {
    const map = new Map<number, typeof submission.documents>();
    for (const doc of submission.documents ?? []) {
      if (!map.has(doc.indicator_id)) {
        map.set(doc.indicator_id, []);
      }
      map.get(doc.indicator_id)!.push(doc);
    }
    return map;
  }, [submission]);

  // Dokumen fase saat ini saja — untuk cek kuota 10 per fase
  const currentPhase = submission.current_upload_phase ?? 1;
  const currentPhaseDocsByIndicator = useMemo(() => {
    const map = new Map<number, typeof submission.documents>();
    for (const doc of submission.documents ?? []) {
      if ((doc.upload_phase ?? 1) !== currentPhase) continue;
      if (!map.has(doc.indicator_id)) {
        map.set(doc.indicator_id, []);
      }
      map.get(doc.indicator_id)!.push(doc);
    }
    return map;
  }, [submission, currentPhase]);

  const toggleAspect = (name: string) => {
    setExpandedAspects((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const toggleIndicator = (id: number) => {
    setExpandedIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const canEdit   = [2, 4].includes(submission.status.id);
  // Status 2 (Draft): bebas hapus semua dokumen
  // Status 4 (Revisi): hanya boleh hapus dokumen dari fase saat ini
  const canDeleteDoc = (doc: { upload_phase?: number }) => {
    if (submission.status.id === 2) return true;
    if (submission.status.id === 4) {
      return (doc.upload_phase ?? 1) === currentPhase;
    }
    return false;
  };

  let totalQuestions = 0;
  let answeredQuestions = 0;
  let mandatoryTotal = 0;
  let mandatoryAnswered = 0;
  for (const pi of submission.per_indicators ?? []) {
    for (const q of pi.indicator.questions) {
      totalQuestions++;
      const isAnswered =
        (answers[q.id] ?? null) !== null &&
        (answers[q.id] ?? undefined) !== undefined;
      if (isAnswered) answeredQuestions++;
      if (pi.indicator.is_mandatory || q.is_mandatory) {
        mandatoryTotal++;
        if (isAnswered) mandatoryAnswered++;
      }
    }
  }
  const progressPercent =
    totalQuestions > 0
      ? Math.round((answeredQuestions / totalQuestions) * 100)
      : 0;
  const mandatoryUnanswered = mandatoryTotal - mandatoryAnswered;

  const [showUnansweredOnly, setShowUnansweredOnly] = useState(false);
  const [showRevisionOnly, setShowRevisionOnly] = useState(false);

  const revisionIndicatorsCount = useMemo(() => {
    return (submission.per_indicators ?? []).filter((pi) => pi.status?.id === 5).length;
  }, [submission.per_indicators]);

  // Helper calculation for fulfilled indicators & mandatory indicator progress
  const indicatorStats = useMemo(() => {
    let fulfilled = 0;
    let fulfilledMandatory = 0;
    let totalMandatory = 0;
    const perInds = submission.per_indicators ?? [];

    for (const pi of perInds) {
      const isMandatory = !!pi.indicator.is_mandatory;
      if (isMandatory) totalMandatory++;

      const questions = pi.indicator.questions ?? [];
      const isFulfilled =
        questions.length > 0 &&
        questions.every((q) => {
          const val = answers[q.id];
          return val !== undefined && val !== null && val > 0;
        });

      if (isFulfilled) {
        fulfilled++;
        if (isMandatory) fulfilledMandatory++;
      }
    }

    return {
      fulfilled,
      fulfilledMandatory,
      totalMandatory: totalMandatory || 22,
      totalIndicators: perInds.length || 50,
    };
  }, [submission.per_indicators, answers]);

  // Helper calculation for unanswered counts per aspect
  const aspectUnansweredCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const [aspectName, outcomeMap] of grouped.entries()) {
      let count = 0;
      for (const principleMap of outcomeMap.values()) {
        for (const perIndicators of principleMap.values()) {
          for (const pi of perIndicators) {
            for (const q of pi.indicator.questions) {
              const val = answers[q.id];
              if (val === undefined && !pendingYes.has(q.id)) {
                count++;
              }
            }
          }
        }
      }
      counts.set(aspectName, count);
    }
    return counts;
  }, [grouped, answers, pendingYes]);

  return (
    <div>
      {/* Progress & Live Score Summary Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Progress Tracker Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Kelengkapan Kuesioner
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-mono text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto-Saved
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {progressPercent}%
              </span>
              <span className="text-xs font-bold text-slate-400">
                {answeredQuestions} dari {totalQuestions} terjawab
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Skor Awal (Self-Assessment)
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
              Pertanyaan terjawab saat ini
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl md:text-3xl font-extrabold text-[#0c2340] dark:text-blue-300 tracking-tight">
              {answeredQuestions}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">
              {" "}
              / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Fulfilled Indicators Card */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {locale === "en" ? "Fulfilled Indicators" : "Indikator Terpenuhi"}
            </p>
            <span
              className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-extrabold border shrink-0",
                indicatorStats.fulfilledMandatory >= indicatorStats.totalMandatory
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/60 dark:text-amber-300 dark:border-amber-800"
              )}>
              {indicatorStats.fulfilledMandatory}/{indicatorStats.totalMandatory} ★ {locale === "en" ? "Mandatory" : "Wajib"}
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1">
              <div>
                <span
                  className={cn(
                    "text-2xl md:text-3xl font-extrabold tracking-tight",
                    indicatorStats.fulfilled >= 35
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-[#0c2340] dark:text-white"
                  )}>
                  {indicatorStats.fulfilled}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">
                  {" "}
                  / {indicatorStats.totalIndicators}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Target: min. 35
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-snug">
              {locale === "en"
                ? `Min. 35 indicators required (${indicatorStats.totalMandatory} must be mandatory)`
                : `Minimal 35 indikator (${indicatorStats.totalMandatory} di antaranya wajib)`}
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Warning Banner */}
      {mandatoryUnanswered > 0 && canEdit && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-950/40 px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-300">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-extrabold text-red-700 dark:text-red-300">
              {locale === "en"
                ? `${mandatoryUnanswered} mandatory question${mandatoryUnanswered > 1 ? "s" : ""} not yet answered`
                : `${mandatoryUnanswered} pertanyaan wajib belum dijawab`}
            </p>
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
              {locale === "en"
                ? "Please answer all mandatory questions (marked ★ Mandatory) before submitting."
                : "Harap jawab semua pertanyaan bertanda ★ Wajib sebelum mengajukan submission."}
            </p>
          </div>
          <span className="ml-auto shrink-0 inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800">
            {mandatoryAnswered}/{mandatoryTotal} ★
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">
            Kuesioner Assessment Blue Economy
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Isi semua pertanyaan sesuai kondisi aktual operasional perusahaan
            Anda
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Scoring Guide Button */}
          <button
            onClick={() => setShowScoringGuide(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
            <Info size={14} />
            <span>Panduan Skoring</span>
          </button>

          {/* Revision Filter Toggle Button (Shown when revision indicators exist) */}
          {revisionIndicatorsCount > 0 && (
            <button
              onClick={() => {
                const nextVal = !showRevisionOnly;
                setShowRevisionOnly(nextVal);
                if (nextVal) {
                  setShowUnansweredOnly(false);
                  // Auto expand all aspects and indicators that need revision
                  const newAspects = new Set<string>();
                  const newIndicators = new Set<number>();
                  for (const pi of submission.per_indicators ?? []) {
                    if (pi.status?.id === 5) {
                      newAspects.add(pi.indicator.principle.outcome.aspect.name);
                      newIndicators.add(pi.indicator_id);
                    }
                  }
                  setExpandedAspects(newAspects);
                  setExpandedIndicators(newIndicators);
                }
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-2xs flex items-center gap-1.5 cursor-pointer animate-pulse",
                showRevisionOnly
                  ? "bg-amber-600 border-amber-700 text-white dark:bg-amber-600 dark:border-amber-500"
                  : "bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-200"
              )}>
              <MdWarning className="w-4 h-4" />
              <span>
                {showRevisionOnly
                  ? "Tampilkan Semua Indikator"
                  : `Filter: Indikator Revisi (${revisionIndicatorsCount})`}
              </span>
            </button>
          )}

          {/* Unanswered Filter Toggle Button */}
          <button
            onClick={() => {
              const nextVal = !showUnansweredOnly;
              setShowUnansweredOnly(nextVal);
              if (nextVal) {
                setShowRevisionOnly(false);
                // Auto expand aspects with unanswered questions
                const newAspects = new Set<string>();
                for (const [
                  aspectName,
                  count,
                ] of aspectUnansweredCounts.entries()) {
                  if (count > 0) newAspects.add(aspectName);
                }
                setExpandedAspects(newAspects);
              }
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-2xs flex items-center gap-1.5 cursor-pointer",
              showUnansweredOnly
                ? "bg-amber-500 border-amber-600 text-white dark:bg-amber-600 dark:border-amber-500"
                : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80",
            )}>
            {showUnansweredOnly ? (
              <>
                <MdCheckCircle className="w-4 h-4" />
                <span>
                  {t.tab_assessment_show_all || "Tampilkan Semua Pertanyaan"}
                </span>
              </>
            ) : (
              <>
                <MdSearch className="w-4 h-4" />
                <span>
                  {t.tab_assessment_filter_unanswered ||
                    "Filter: Belum Terjawab"}
                </span>
              </>
            )}
          </button>

          {canEdit && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium">
              {saveSingleAnswerMutation.isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin text-blue-500" />
                  <span className="text-blue-500 font-bold">
                    {t.tab_assessment_saving || "Menyimpan..."}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-slate-600 dark:text-slate-300 font-bold">
                    Auto-Saved
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {Array.from(grouped.entries()).map(([aspectName, outcomeMap]) => {
          const aspectUnanswered = aspectUnansweredCounts.get(aspectName) ?? 0;
          const hasRevisionInAspect = (submission.per_indicators ?? []).some(
            (pi) => pi.indicator.principle.outcome.aspect.name === aspectName && pi.status?.id === 5
          );

          if (showUnansweredOnly && aspectUnanswered === 0) return null;
          if (showRevisionOnly && !hasRevisionInAspect) return null;

          return (
            <div
              key={aspectName}
              className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs bg-white dark:bg-slate-900 transition-colors">
              {/* Aspect Header */}
              <button
                onClick={() => toggleAspect(aspectName)}
                className="w-full flex items-center justify-between px-5 py-4 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[#0c2340] dark:text-white text-sm tracking-tight">
                    {aspectName}
                  </span>
                  {aspectUnanswered > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <MdWarning className="w-3.5 h-3.5" />
                      <span>
                        {aspectUnanswered}{" "}
                        {t.tab_assessment_unanswered || "Belum Terjawab"}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <MdCheckCircle className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </span>
                  )}
                </div>
                {expandedAspects.has(aspectName) ? (
                  <ChevronDown
                    size={18}
                    className="text-blue-600 dark:text-blue-400 shrink-0"
                  />
                ) : (
                  <ChevronRight size={18} className="text-slate-400 shrink-0" />
                )}
              </button>

              {expandedAspects.has(aspectName) && (
                <div className="p-4 space-y-4">
                  {Array.from(outcomeMap.entries()).map(
                    ([outcomeName, principleMap]) => (
                      <div key={outcomeName} className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 pt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{outcomeName}</span>
                        </div>

                        {Array.from(principleMap.entries()).map(
                          ([principleName, perIndicators]) => (
                            <div
                              key={principleName}
                              className="pl-2 space-y-2.5">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold px-1 flex items-center gap-1.5">
                                <span>&bull;</span>
                                <span>
                                  Principle{" "}
                                  {principleNumberMap.get(principleName)}:{" "}
                                  {principleName}
                                </span>
                              </p>

                              {perIndicators.map((pi) => {
                                // Check if indicator has any unanswered questions
                                const indUnanswered =
                                  pi.indicator.questions.filter(
                                    (q) =>
                                      answers[q.id] === undefined &&
                                      !pendingYes.has(q.id),
                                  ).length;
                                if (showUnansweredOnly && indUnanswered === 0)
                                  return null;
                                if (showRevisionOnly && pi.status?.id !== 5)
                                  return null;

                                // Lock indicators that are already valid (status 3) during revision phase (status 4)
                                const isIndicatorEditable =
                                  canEdit &&
                                  !(
                                    submission.status.id === 4 &&
                                    (pi.status?.id === 4 || pi.status?.id === 6)
                                  );

                                return (
                                  <div
                                    key={pi.id}
                                    className={cn(
                                      "border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs transition-all",
                                      pi.status?.id === 5
                                        ? "border-amber-400 dark:border-amber-600 bg-amber-50/20 dark:bg-amber-950/20 ring-2 ring-amber-400/40"
                                        : "border-slate-200/60 dark:border-slate-800/80"
                                    )}>
                                    {/* Indicator Header */}
                                    <button
                                      onClick={() =>
                                        toggleIndicator(pi.indicator_id)
                                      }
                                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer">
                                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                        <span
                                          className={cn(
                                            "w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs",
                                            pi.status?.id === 5
                                              ? "bg-amber-500 animate-ping"
                                              : indUnanswered > 0
                                              ? "bg-amber-500 animate-pulse"
                                              : "bg-emerald-500",
                                          )}
                                        />
                                        <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                                          <span className="shrink-0 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono uppercase tracking-widest">
                                            Indicator{" "}
                                            {indicatorNumberMap.get(
                                              pi.indicator_id,
                                            ) ?? "—"}
                                          </span>
                                          {locale === "id"
                                            ? pi.indicator.name_id ||
                                              pi.indicator.name
                                            : pi.indicator.name}
                                          {pi.indicator.is_mandatory && (
                                            <span className="text-red-500 font-extrabold text-sm" title="Mandatory Indicator">*</span>
                                          )}
                                          {(pi.indicator.description ||
                                            pi.indicator.description_en ||
                                            pi.indicator.evidence ||
                                            pi.indicator.regulation) && (
                                            <span
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setInfoModalIndicator({
                                                  name:
                                                    locale === "id"
                                                      ? pi.indicator.name_id ||
                                                        pi.indicator.name
                                                      : pi.indicator.name,
                                                  description:
                                                    locale === "en"
                                                      ? pi.indicator
                                                          .description_en ||
                                                        pi.indicator.description
                                                      : pi.indicator
                                                          .description ||
                                                        pi.indicator
                                                          .description_en,
                                                  evidence:
                                                    locale === "en"
                                                      ? pi.indicator
                                                          .evidence_en ||
                                                        pi.indicator.evidence
                                                      : pi.indicator.evidence ||
                                                        pi.indicator
                                                          .evidence_en,
                                                  verification_method:
                                                    locale === "en"
                                                      ? pi.indicator
                                                          .verification_method_en ||
                                                        pi.indicator
                                                          .verification_method
                                                      : pi.indicator
                                                          .verification_method ||
                                                        pi.indicator
                                                          .verification_method_en,
                                                  regulation:
                                                    locale === "en"
                                                      ? pi.indicator
                                                          .regulation_en ||
                                                        pi.indicator.regulation
                                                      : pi.indicator
                                                          .regulation ||
                                                        pi.indicator
                                                          .regulation_en,
                                                });
                                              }}
                                              className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors px-2.5 py-1 rounded-full cursor-pointer shrink-0"
                                              title="Lihat Syarat & Bukti Indikator">
                                              <Info size={14} />
                                              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                                                {t.indicator_detail_btn ||
                                                  "Detail Syarat"}
                                              </span>
                                            </span>
                                          )}
                                        </span>
                                        {indUnanswered > 0 && (
                                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800 shrink-0">
                                            {indUnanswered} pertanyaan
                                          </span>
                                        )}
                                        {submission.status.id === 4 && pi.status?.id === 4 && (
                                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800 shrink-0">
                                            <MdCheckCircle className="inline w-3 h-3 mr-1 mb-0.5" />
                                            {t.tab_assessment_done || "Lolos Verifikasi"}
                                          </span>
                                        )}
                                        {pi.status?.id === 5 && (
                                          <span className="text-[10px] font-extrabold text-amber-900 dark:text-amber-100 bg-amber-400 dark:bg-amber-600 px-2.5 py-0.5 rounded-md border border-amber-500 shrink-0 animate-pulse shadow-2xs">
                                            <MdWarning className="inline w-3.5 h-3.5 mr-1 mb-0.5 text-amber-950 dark:text-white" />
                                            Butuh Revisi
                                          </span>
                                        )}
                                        {submission.status.id === 4 && pi.status?.id === 6 && (
                                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-800 shrink-0">
                                            <XCircle className="inline w-3 h-3 mr-1 mb-0.5" />
                                            Gagal (Invalid)
                                          </span>
                                        )}
                                      </div>
                                      {expandedIndicators.has(
                                        pi.indicator_id,
                                      ) ? (
                                        <ChevronDown
                                          size={16}
                                          className="text-blue-600 dark:text-blue-400 shrink-0 ml-2"
                                        />
                                      ) : (
                                        <ChevronRight
                                          size={16}
                                          className="text-slate-400 shrink-0 ml-2"
                                        />
                                      )}
                                    </button>

                                    {/* Questions & Documents */}
                                    {expandedIndicators.has(
                                      pi.indicator_id,
                                    ) && (
                                      <div className="bg-slate-50/50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-4">
                                        {/* Auditor Revision Note Callout Box */}
                                        {pi.status?.id === 5 && (
                                          <div className="bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-400 dark:border-amber-700 rounded-xl p-4 mb-4 text-xs text-amber-950 dark:text-amber-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-1 font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                                              <MdWarning className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                              <span>📌 Catatan &amp; Instruksi Revisi Auditor:</span>
                                            </div>
                                            <p className="font-extrabold text-slate-900 dark:text-white text-sm pl-6 leading-relaxed">
                                              {pi.comment ? `"${pi.comment}"` : "Silakan periksa kembali jawaban dan berkas pendukung pada indikator ini."}
                                            </p>
                                          </div>
                                        )}

                                        <div className="space-y-3">
                                          {pi.indicator.questions.map(
                                            (question) => {
                                              // Fix Bug #2: isYes checks pendingYes OR stored score > 0
                                              const storedValue =
                                                answers[question.id];
                                              const hasSavedScore =
                                                storedValue !== undefined &&
                                                storedValue > 0;
                                              const isPendingYes =
                                                pendingYes.has(question.id);
                                              const isYes =
                                                isPendingYes || hasSavedScore;
                                              // Fix Bug #4: Clearly distinguish unanswered vs answered "Tidak"
                                              const isExplicitlyNo =
                                                storedValue === 0;

                                              return (
                                                <div
                                                  key={question.id}
                                                  className="flex items-start justify-between gap-4">
                                                  <div className="flex-1">
                                                    <div className="flex items-start gap-2 flex-wrap mb-1">
                                                      {(pi.indicator.is_mandatory || question.is_mandatory) && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-700 shrink-0 mt-0.5">
                                                          ★ {locale === "en" ? "Mandatory" : "Wajib"}
                                                        </span>
                                                      )}
                                                      <p
                                                        className="text-xs md:text-sm text-slate-700 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed"
                                                        dangerouslySetInnerHTML={{
                                                          __html:
                                                            (locale === "en"
                                                              ? question.text_en ||
                                                                question.text
                                                              : question.text ||
                                                                question.text_en) ??
                                                            "",
                                                        }}
                                                      />
                                                    </div>
                                                    {!ENABLE_SCORE_SELECTION && (
                                                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                                        <Info size={10} />
                                                        {locale === "en"
                                                          ? '(When "Yes", automatically Score 2)'
                                                          : '(Ketika "Ya", otomatis bernilai Skor 2)'}
                                                      </p>
                                                    )}
                                                  </div>
                                                  {isIndicatorEditable ? (
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                      {/* Ya Button */}
                                                      <button
                                                        onClick={() =>
                                                          handleYesClick(
                                                            question.id,
                                                          )
                                                        }
                                                        className={cn(
                                                          "px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer",
                                                          isYes
                                                            ? "bg-green-500 text-white"
                                                            : "bg-gray-100 text-gray-500 hover:bg-green-50",
                                                        )}>
                                                        Ya
                                                      </button>
                                                      {/* Tidak Button */}
                                                      <button
                                                        onClick={() => {
                                                          if (pi.indicator.is_mandatory || question.is_mandatory) {
                                                            toast.error(
                                                              locale === "en"
                                                                ? "This is a mandatory requirement and must be answered 'Yes'."
                                                                : "Pertanyaan ini bersifat wajib dan harus dijawab 'Ya'."
                                                            );
                                                            return;
                                                          }
                                                          handleNoClick(
                                                            question.id,
                                                            pi,
                                                            uploadedDocsByIndicator,
                                                          );
                                                        }}
                                                        className={cn(
                                                          "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                                                          isExplicitlyNo
                                                            ? "bg-red-500 text-white"
                                                            : "bg-gray-100 text-gray-500 hover:bg-red-50",
                                                          (pi.indicator.is_mandatory || question.is_mandatory)
                                                            ? "opacity-50 cursor-not-allowed hover:bg-gray-100 hover:text-gray-500"
                                                            : "cursor-pointer"
                                                        )}
                                                        title={
                                                          (pi.indicator.is_mandatory || question.is_mandatory)
                                                            ? (locale === "en" ? "Mandatory question must be answered Yes" : "Pertanyaan wajib harus dijawab Ya")
                                                            : undefined
                                                        }
                                                      >
                                                        Tidak
                                                      </button>

                                                      {/* Fix Bug #2: Score dropdown — only show when "Ya", and require selection */}
                                                      {ENABLE_SCORE_SELECTION &&
                                                        isYes && (
                                                          <select
                                                            value={
                                                              hasSavedScore
                                                                ? storedValue
                                                                : ""
                                                            }
                                                            onChange={(e) => {
                                                              const val =
                                                                e.target
                                                                  .value === ""
                                                                  ? null
                                                                  : Number(
                                                                      e.target
                                                                        .value,
                                                                    );
                                                              if (
                                                                val !== null
                                                              ) {
                                                                handleScoreSelect(
                                                                  question.id,
                                                                  val,
                                                                );
                                                              }
                                                            }}
                                                            className={cn(
                                                              "px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4e73df] cursor-pointer",
                                                              isPendingYes &&
                                                                !hasSavedScore
                                                                ? "border-amber-400 bg-amber-50 text-amber-700" // Highlight: score not yet selected
                                                                : "border-slate-200 bg-white",
                                                            )}>
                                                            <option value="">
                                                              {isPendingYes &&
                                                              !hasSavedScore
                                                                ? "Pilih Skor"
                                                                : "Skor"}
                                                            </option>
                                                            <option value="0.5">
                                                              0.5
                                                            </option>
                                                            <option value="1">
                                                              1
                                                            </option>
                                                            <option value="2">
                                                              2
                                                            </option>
                                                          </select>
                                                        )}

                                                      {/* Bug #3: Warning icon when pendingYes but no score */}
                                                      {ENABLE_SCORE_SELECTION &&
                                                        isPendingYes &&
                                                        !hasSavedScore && (
                                                          <span title="Pilih skor terlebih dahulu">
                                                            <AlertTriangle
                                                              size={14}
                                                              className="text-amber-500 shrink-0"
                                                            />
                                                          </span>
                                                        )}
                                                    </div>
                                                  ) : (
                                                    // Fix Bug #4: View mode — clear badge for unanswered / Tidak / Ya
                                                    <div className="flex items-center gap-2 shrink-0">
                                                      <span
                                                        className={cn(
                                                          "px-2 py-0.5 rounded-full text-xs font-semibold",
                                                          isYes
                                                            ? "bg-green-100 text-green-700"
                                                            : isExplicitlyNo
                                                              ? "bg-red-100 text-red-700"
                                                              : "bg-gray-100 text-gray-400 italic",
                                                        )}>
                                                        {isYes
                                                          ? "Ya"
                                                          : isExplicitlyNo
                                                            ? "Tidak"
                                                            : "Belum Diisi"}
                                                      </span>
                                                      {isYes &&
                                                        storedValue !==
                                                          undefined && (
                                                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                                                            Skor: {storedValue}
                                                          </span>
                                                        )}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            },
                                          )}
                                        </div>

                                        {/* Dynamic Document Upload Section — only show if any question answered "Ya" */}
                                        {pi.indicator.questions.some(
                                          (q) =>
                                            pendingYes.has(q.id) ||
                                            (answers[q.id] ?? 0) > 0,
                                        ) && (
                                          <div className="border-t border-slate-200/60 pt-4 mt-2">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                              Dokumen Pendukung Indikator
                                            </h4>

                                            {/* Warning if any question is in pendingYes (score not yet selected) */}
                                            {ENABLE_SCORE_SELECTION &&
                                              pi.indicator.questions.some((q) =>
                                                pendingYes.has(q.id),
                                              ) && (
                                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                                                  <AlertTriangle
                                                    size={13}
                                                    className="text-amber-500 shrink-0"
                                                  />
                                                  <p className="text-xs text-amber-700">
                                                    Pilih skor untuk jawaban
                                                    &quot;Ya&quot; sebelum
                                                    mengupload dokumen.
                                                  </p>
                                                </div>
                                              )}

                                            {/* Uploaded Documents List */}
                                            {(() => {
                                              const docs =
                                                uploadedDocsByIndicator.get(
                                                  pi.indicator_id,
                                                ) ?? [];
                                              return (
                                                <>
                                                  {docs.length > 0 && (
                                                    <div className="space-y-1.5 mb-3">
                                                      {docs.map((doc) => (
                                                        <div
                                                          key={doc.id}
                                                          className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-100 shadow-xs">
                                                          <div className="flex items-center gap-2 min-w-0">
                                                            <FileText
                                                              size={14}
                                                              className="text-blue-500 shrink-0"
                                                            />
                                                            <a
                                                              href={
                                                                doc.file_url
                                                              }
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="text-xs text-slate-700 hover:text-blue-600 truncate font-medium">
                                                              {
                                                                doc.original_name
                                                              }
                                                            </a>
                                                          </div>
                                                          {canDeleteDoc(doc) && (
                                                            <button
                                                              onClick={() =>
                                                                deleteMutation.mutate(
                                                                  doc.id,
                                                                )
                                                              }
                                                              disabled={
                                                                deleteMutation.isPending
                                                              }
                                                              className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                                              title="Hapus dokumen"
                                                            >
                                                              <Trash2
                                                                size={13}
                                                              />
                                                            </button>
                                                          )}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  )}

                                                  {/* Upload Zone */}
                                                  {isIndicatorEditable && (() => {
                                                    const phaseDocs = currentPhaseDocsByIndicator.get(pi.indicator_id) ?? [];
                                                    const phaseQuotaFull = phaseDocs.length >= 10;
                                                    if (phaseQuotaFull) {
                                                      return (
                                                        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-2.5">
                                                          <span className="font-bold">Kuota fase ini penuh</span>
                                                          <span className="text-amber-600 dark:text-amber-400">({phaseDocs.length}/10 dokumen)</span>
                                                        </div>
                                                      );
                                                    }
                                                    return (
                                                      <DocumentUploadZone
                                                        submissionId={submission.id}
                                                        indicatorId={pi.indicator_id}
                                                        indicatorName={pi.indicator.name}
                                                        onSuccess={onUpdate}
                                                      />
                                                    );
                                                  })()}

                                                  {!isIndicatorEditable &&
                                                    docs.length === 0 && (
                                                      <span className="text-[10px] text-slate-400 italic mt-1 truncate max-w-50 block">
                                                        {t.tab_assessment_no_doc ||
                                                          "Belum ada dokumen pendukung"}
                                                      </span>
                                                    )}
                                                </>
                                              );
                                            })()}

                                            {/* Indicator Chat Component */}
                                            {(!isIndicatorEditable ||
                                              pi.status?.id === 4 ||
                                              pi.status?.id === 5 ||
                                              pi.status?.id === 6) && (
                                              <div className="mt-6 border-t border-slate-200/60 dark:border-slate-800 pt-5">
                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                  <MessageSquare
                                                    size={14}
                                                    className="text-blue-500"
                                                  />
                                                  Diskusi & Catatan Asesor
                                                </h4>
                                                <IndicatorChat
                                                  submissionId={submission.id}
                                                  indicatorId={pi.indicator_id}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ),
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Submit & Pay Action */}
      {onGoToScore && (
        <div className="mt-8 mb-4 flex justify-end">
          <button
            onClick={onGoToScore}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-extrabold text-white transition-all shadow-lg cursor-pointer",
              submission.requires_payment
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
            )}>
            <span>
              {submission.is_post_survey_revision && submission.requires_payment
                ? "Lanjut ke Pembayaran Survei & Kirim Revisi"
                : submission.requires_payment
                ? "Lanjut ke Skor & Pembayaran"
                : "Lanjut ke Skor & Kirim Revisi (Gratis)"}
            </span>
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Info Modal — Audit Checklist Detail */}
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
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
              {/* Description */}
              {infoModalIndicator.description && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <BookOpen size={11} />{" "}
                    {t.assessment_modal_desc || "Deskripsi Indikator"}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {infoModalIndicator.description}
                  </p>
                </div>
              )}

              {/* Evidence */}
              {infoModalIndicator.evidence && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                  <p className="text-[10px] font-bold text-amber-700 dark:amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <FileText size={11} />{" "}
                    {t.assessment_modal_evidence || "Bukti yang Diperlukan"}
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
                    <CheckCircle2 size={11} />{" "}
                    {t.assessment_modal_verification || "Metode Verifikasi"}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {infoModalIndicator.verification_method}
                  </p>
                </div>
              )}

              {/* Regulation — only visible for Indonesian companies */}
              {isIndonesianCompany && infoModalIndicator.regulation && (
                <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
                  <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Scale size={11} />{" "}
                    {t.assessment_modal_regulation || "Dasar Hukum & Regulasi"}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {infoModalIndicator.regulation}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t.assessment_modal_footer_text ||
                  "Siapkan semua dokumen sebelum mengupload"}
              </p>
              <button
                onClick={() => setInfoModalIndicator(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer text-sm">
                {t.assessment_modal_btn_understand || "Mengerti"}
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
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-extrabold text-slate-700 dark:text-slate-300 shrink-0">
                    0
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.score_0_title || "Tidak Ada Bukti"}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t.score_0_desc ||
                        "Tidak ada komitmen tertulis, kebijakan, SOP, maupun bukti implementasi sama sekali."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center font-extrabold text-amber-700 dark:text-amber-400 shrink-0">
                    0.5
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.score_1_title || "Ada Komitmen"}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t.score_1_desc ||
                        "Terdapat bukti berupa komitmen, kebijakan, atau SOP tertulis, namun belum terbukti diimplementasikan di lapangan."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center font-extrabold text-blue-700 dark:text-blue-400 shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.score_2_title || "Implementasi Sebagian"}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t.score_2_desc ||
                        "Kebijakan sudah mulai diimplementasikan sebagian, namun bukti lapangan/rekam jejak belum komprehensif."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.score_3_title || "Implementasi Penuh"}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t.score_3_desc ||
                        "Implementasi penuh secara menyeluruh. Dibuktikan dengan data pendukung yang valid, terukur, dapat dilacak, dan konsisten."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
