"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  X,
  Loader2,
  Award,
  Building2,
  ShieldCheck,
  Calendar,
  UserCheck,
  CheckCircle2,
  Globe,
  Search,
  AlertCircle
} from "lucide-react";

interface CompanyItem {
  id: number;
  name: string;
  email: string;
  brand_name?: string | null;
  pic_name?: string | null;
  company_country?: string;
  sector?: string | null;
  has_submission: boolean;
  is_certified: boolean;
  existing_cert?: {
    id: number;
    mmic: string;
    is_approved: boolean;
    valid_until?: string | null;
  } | null;
}

interface CertificateCategoryItem {
  id: number;
  category: string;
  description: string;
}

interface DirectIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUserId?: number | null;
}

export function DirectIssueCertificateModal({
  isOpen,
  onClose,
  preselectedUserId,
}: DirectIssueModalProps) {
  const queryClient = useQueryClient();

  // Form State
  const [userId, setUserId] = useState<number | "">("");
  const [certificateId, setCertificateId] = useState<number>(10); // default 10: Good
  const [mmic, setMmic] = useState("");
  const [direktur, setDirektur] = useState("Rahmat Ihsan, S.H.");
  const [publishedAt, setPublishedAt] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [score, setScore] = useState<string>("85.00");
  const [isApproved, setIsApproved] = useState(true);
  const [isDetailPublic, setIsDetailPublic] = useState(true);
  const [companySearch, setCompanySearch] = useState("");

  // Fetch eligible companies and templates
  const { data: eligibleData, isLoading: isLoadingEligible } = useQuery({
    queryKey: ["admin-eligible-companies"],
    queryFn: async () => {
      const res = await api.get("/admin/certificates/eligible-companies");
      return res.data as {
        companies: CompanyItem[];
        certificates: CertificateCategoryItem[];
        next_bicc: string;
        default_director: string;
      };
    },
    enabled: isOpen,
  });

  const companies = eligibleData?.companies || [];
  const certificates = eligibleData?.certificates || [];

  // Inisialisasi default dates dan BICC number
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const threeYears = new Date();
      threeYears.setFullYear(today.getFullYear() + 3);
      threeYears.setDate(threeYears.getDate() - 1);

      const todayStr = today.toISOString().split("T")[0];
      const validStr = threeYears.toISOString().split("T")[0];

      setPublishedAt(todayStr);
      setValidUntil(validStr);
      setDirektur(eligibleData?.default_director || "Rahmat Ihsan, S.H.");
      setMmic(eligibleData?.next_bicc || "");
      setIsApproved(true);
      setIsDetailPublic(true);
      setScore("85.00");

      if (preselectedUserId) {
        setUserId(preselectedUserId);
      } else {
        setUserId("");
      }
    }
  }, [isOpen, eligibleData, preselectedUserId]);

  // Filtered companies based on search
  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companies;
    const q = companySearch.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.brand_name && c.brand_name.toLowerCase().includes(q))
    );
  }, [companies, companySearch]);

  const selectedCompany = useMemo(() => {
    if (!userId) return null;
    return companies.find((c) => c.id === Number(userId)) || null;
  }, [companies, userId]);

  // Mutation
  const issueMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Pilih perusahaan terlebih dahulu.");
      const payload = {
        user_id: Number(userId),
        certificate_id: Number(certificateId),
        mmic: mmic.trim(),
        direktur: direktur.trim(),
        published_at: publishedAt,
        valid_until: validUntil,
        score: parseFloat(score) || 85.0,
        is_approved: isApproved,
        is_detail_public: isDetailPublic,
      };
      const res = await api.post("/admin/certificates/direct-issue", payload);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Perusahaan berhasil diterbitkan ke katalog!");
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["admin-eligible-companies"] });
      queryClient.invalidateQueries({ queryKey: ["verified-companies"] });
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menerbitkan sertifikat perusahaan.";
      toast.error(msg);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 my-8 overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                Terbitkan ke Katalog Publik
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Munculkan perusahaan di Verified Companies tanpa mewajibkan isi asesmen mandiri.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Pilih Perusahaan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
              Pilih Perusahaan <span className="text-rose-500">*</span>
            </label>

            {isLoadingEligible ? (
              <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span>Memuat data perusahaan...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="Ketik untuk mencari nama perusahaan atau email..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <select
                  value={userId}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : "";
                    setUserId(val);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Pilih Perusahaan Terdaftar --</option>
                  {filteredCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email}) {c.is_certified ? "• [Sudah di Katalog]" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Info Kartu Perusahaan Terpilih */}
            {selectedCompany && (
              <div className="mt-3 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-xs">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Building2 size={14} className="text-blue-600" />
                    {selectedCompany.name}
                  </span>
                  {selectedCompany.is_certified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      <CheckCircle2 size={12} />
                      Sudah Aktif di Katalog
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
                  <p>
                    <strong className="text-slate-700 dark:text-slate-200">PIC:</strong> {selectedCompany.pic_name || "—"}
                  </p>
                  <p>
                    <strong className="text-slate-700 dark:text-slate-200">Sektor:</strong> {selectedCompany.sector || "Sektor Maritim"}
                  </p>
                  <p>
                    <strong className="text-slate-700 dark:text-slate-200">Negara:</strong> {selectedCompany.company_country}
                  </p>
                  <p>
                    <strong className="text-slate-700 dark:text-slate-200">Status Asesmen:</strong>{" "}
                    {selectedCompany.has_submission ? "Ada draft/pengajuan" : "Belum pernah mengisi"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Kategori Sertifikat BECdex */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
              Kategori Sertifikat BECdex <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {certificates.map((cat) => {
                const isSelected = certificateId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCertificateId(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 dark:bg-blue-950/60 dark:text-white dark:border-blue-500 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs capitalize">{cat.category}</span>
                      {isSelected && <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {cat.description || `Kategori ${cat.category}`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Nomor Registrasi BICC & Skor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Nomor Registrasi BICC
              </label>
              <input
                type="text"
                value={mmic}
                onChange={(e) => setMmic(e.target.value)}
                placeholder="Contoh: BICCID006112026"
                className="w-full px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-blue-700 dark:text-blue-300 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Otomatis dihitung sesuai urutan sertifikat terbaru</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Skor Validasi (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="85.00"
                className="w-full px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-800 dark:text-white focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Skor indeks penilaian yang tercantum</span>
            </div>
          </div>

          {/* 4. Direktur & Tanggal Masa Berlaku */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Direktur Penandatangan
              </label>
              <input
                type="text"
                value={direktur}
                onChange={(e) => setDirektur(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Tanggal Diterbitkan
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Berlaku Hingga
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 5. Opsi Visibilitas & Publikasi */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isApproved}
                onChange={(e) => setIsApproved(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block">
                  Langsung Tampilkan di Katalog Verified Companies (Disetujui)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Jika dicentang, sertifikat langsung berstatus aktif dan muncul di halaman katalog publik becdex.com.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <input
                type="checkbox"
                checked={isDetailPublic}
                onChange={(e) => setIsDetailPublic(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block">
                  Buka Halaman Detail untuk Publik
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kartu di katalog dapat diklik untuk membuka profil verifikasi lengkap di /verified-companies/[serial_id].
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            disabled={issueMutation.isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => issueMutation.mutate()}
            disabled={!userId || issueMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            {issueMutation.isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Menerbitkan...</span>
              </>
            ) : (
              <>
                <Globe size={15} />
                <span>Terbitkan ke Katalog</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
