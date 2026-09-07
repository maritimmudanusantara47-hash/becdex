"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
  Zap,
  Scale,
  BookOpen,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/store/lang";

interface Question {
  id: number;
  text: string;
  text_en?: string | null;
}

interface Indicator {
  id: number;
  name: string;
  name_id?: string | null;
  description: string | null;
  description_en?: string | null;
  evidence: string | null;
  evidence_en?: string | null;
  verification_method: string | null;
  verification_method_en?: string | null;
  regulation: string | null;
  regulation_en?: string | null;
  sort_order: number;
  questions: Question[];
  principle?: {
    id: number;
    name: string;
    name_id?: string | null;
    outcome?: {
      id: number;
      name: string;
      name_id?: string | null;
      aspect?: {
        id: number;
        name: string;
        name_id?: string | null;
      };
    };
  };
}

const ASPECT_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; icon: React.ElementType; badge: string }
> = {
  "Environmental Aspect": {
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: Shield,
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  "Social Aspect": {
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: Scale,
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  "Economic Aspect": {
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    icon: Zap,
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
};

function IndicatorRow({
  indicator,
  number,
  aspectConfig,
}: {
  indicator: Indicator;
  number: number;
  aspectConfig: (typeof ASPECT_CONFIG)[string];
}) {
  const { t, locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const name = locale === 'id' ? (indicator.name_id || indicator.name) : indicator.name;
  const description = locale === 'en' ? (indicator.description_en || indicator.description) : (indicator.description || indicator.description_en);
  const evidence = locale === 'en' ? (indicator.evidence_en || indicator.evidence) : (indicator.evidence || indicator.evidence_en);
  const verificationMethod = locale === 'en' ? (indicator.verification_method_en || indicator.verification_method) : (indicator.verification_method || indicator.verification_method_en);
  const regulation = locale === 'en' ? (indicator.regulation_en || indicator.regulation) : (indicator.regulation || indicator.regulation_en);
  const principleName = locale === 'id' ? (indicator.principle?.name_id || indicator.principle?.name) : indicator.principle?.name;

  return (
    <div className={cn("border rounded-xl overflow-hidden transition-all duration-200", aspectConfig.border)}>
      {/* Header row */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 p-4 text-left hover:opacity-90 transition-opacity",
          aspectConfig.bg
        )}
      >
        <span
          className={cn(
            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
            aspectConfig.badge
          )}
        >
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-sm", aspectConfig.color)}>{name}</p>
          {indicator.principle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {principleName}
            </p>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-slate-400" />
        )}
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div className="p-4 border-t border-inherit bg-white dark:bg-slate-900 space-y-4">
          {/* Description */}
          {description && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BookOpen size={12} />
                {t.assessment_modal_desc || "Deskripsi"}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Evidence */}
            {evidence && (
              <div className={cn("p-3 rounded-lg border", aspectConfig.bg, aspectConfig.border)}>
                <p className={cn("text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5", aspectConfig.color)}>
                  <FileText size={12} />
                  {t.assessment_modal_evidence || "Bukti yang Diperlukan"}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {evidence}
                </p>
              </div>
            )}

            {/* Verification Method */}
            {verificationMethod && (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  {t.assessment_modal_verification || "Metode Verifikasi"}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {verificationMethod}
                </p>
              </div>
            )}
          </div>

          {/* Regulation */}
          {regulation && (
            <div className="p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Scale size={12} />
                {t.assessment_modal_regulation || "Dasar Hukum / Regulasi"}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {regulation}
              </p>
            </div>
          )}

          {/* Questions */}
          {indicator.questions && indicator.questions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ClipboardList size={12} />
                {t.audit_checklist_questions || "Pertanyaan Penilaian Mandiri"}
              </p>
              <ul className="space-y-1.5">
                {indicator.questions.map((q, idx) => (
                  <li key={q.id} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-[10px] font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    {locale === 'en' ? (q.text_en || q.text) : (q.text || q.text_en)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditChecklistPage() {
  const { t } = useTranslation();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeAspect, setActiveAspect] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        setLoading(true);
        const res = await api.get("/public/indicators");
        setIndicators(res.data.data || []);
      } catch {
        setError("Gagal memuat data indikator. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    };
    fetchIndicators();
  }, []);

  // Group by aspect
  const grouped = indicators.reduce(
    (acc, ind) => {
      const aspectName = ind.principle?.outcome?.aspect?.name ?? "Lainnya";
      if (!acc[aspectName]) acc[aspectName] = [];
      acc[aspectName].push(ind);
      return acc;
    },
    {} as Record<string, Indicator[]>
  );

  // Sequential numbering across all aspects
  let counter = 0;
  const numberedGroups = Object.entries(grouped).map(([aspect, inds]) => ({
    aspect,
    items: inds.map((ind) => ({ indicator: ind, number: ++counter })),
  }));

  // Filter by search and active aspect
  const filteredGroups = numberedGroups
    .filter(({ aspect }) => !activeAspect || aspect === activeAspect)
    .map(({ aspect, items }) => ({
      aspect,
      items: items.filter(({ indicator }) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          indicator.name.toLowerCase().includes(q) ||
          indicator.description?.toLowerCase().includes(q) ||
          indicator.evidence?.toLowerCase().includes(q) ||
          indicator.regulation?.toLowerCase().includes(q)
        );
      }),
    }))
    .filter(({ items }) => items.length > 0);

  const aspects = Object.keys(grouped);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={26} className="text-blue-600" />
            {t.audit_checklist_title || "Audit Checklist BECdex"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {t.audit_checklist_desc || "Dokumen referensi lengkap berisi 50 indikator penilaian, bukti yang diperlukan, metode verifikasi, dan dasar hukum yang berlaku."}
          </p>
          <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t.audit_checklist_alert || "Siapkan semua dokumen bukti sesuai indikator sebelum mengajukan submission. Klik pada setiap indikator untuk melihat detail bukti dan regulasi yang diperlukan."}
            </p>
          </div>
          {/* CTA Buttons */}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/submissions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-600/20"
            >
              <FileCheck size={15} />
              {t.audit_checklist_btn_submissions || "Lihat Submission Saya"}
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/dashboard/submissions?new=1"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ClipboardList size={15} />
              {t.audit_checklist_btn_new_submission || "Mulai Submission Baru"}
            </Link>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari indikator, bukti, atau regulasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveAspect(null)}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                !activeAspect
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
              )}
            >
              Semua ({indicators.length})
            </button>
            {aspects.map((aspect) => {
              const config = ASPECT_CONFIG[aspect];
              return (
                <button
                  key={aspect}
                  onClick={() => setActiveAspect(activeAspect === aspect ? null : aspect)}
                  className={cn(
                    "px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                    activeAspect === aspect
                      ? cn(config?.badge ?? "bg-slate-100 text-slate-700", "border-transparent")
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  )}
                >
                  {aspect.replace(" Aspect", "")} ({grouped[aspect]?.length})
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-10 text-red-500 dark:text-red-400 flex flex-col items-center gap-2">
            <AlertTriangle size={28} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && filteredGroups.length === 0 && (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <Search size={28} className="mx-auto mb-2" />
            <p className="text-sm">Tidak ditemukan indikator yang cocok.</p>
          </div>
        )}

        {!loading && !error && filteredGroups.map(({ aspect, items }) => {
          const config = ASPECT_CONFIG[aspect] ?? ASPECT_CONFIG["Environmental Aspect"];
          const Icon = config.icon;
          return (
            <section key={aspect} className="space-y-3">
              {/* Aspect header */}
              <div className={cn("flex items-center gap-3 p-3 rounded-xl border", config.bg, config.border)}>
                <div className={cn("p-2 rounded-lg", config.badge)}>
                  <Icon size={16} />
                </div>
                <div>
                  <h2 className={cn("font-bold text-sm", config.color)}>{aspect}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {items.length} indikator
                  </p>
                </div>
              </div>

              {/* Indicators */}
              <div className="space-y-2 pl-1">
                {items.map(({ indicator, number }) => (
                  <IndicatorRow
                    key={indicator.id}
                    indicator={indicator}
                    number={number}
                    aspectConfig={config}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AppLayout>
  );
}
