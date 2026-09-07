"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layouts/PublicHeader";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import { useTranslation } from "@/store/lang";
import { Home, Compass, ArrowLeft, Search, AlertCircle } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Decorative Background Glowing Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-xl w-full text-center relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Badge & Graphic */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-32 h-32 rounded-3xl bg-linear-to-tr from-blue-600 via-indigo-600 to-sky-500 p-0.5 shadow-xl shadow-blue-500/20">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center flex-col">
                <Compass className="w-14 h-14 text-blue-600 dark:text-blue-400 animate-spin-slow" strokeWidth={1.5} />
              </div>
            </div>
            <span className="absolute -bottom-3 px-3 py-1 bg-red-500 text-white text-[11px] font-bold tracking-widest uppercase rounded-full shadow-md flex items-center gap-1">
              <AlertCircle size={12} />
              404 ERROR
            </span>
          </div>

          {/* Heading and Description */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0c2340] dark:text-white">
              {t.notfound_subtitle || "Oops! Halaman yang Anda cari tidak ditemukan."}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              {t.notfound_desc || "Halaman tersebut mungkin telah dipindahkan, dihapus, atau terjadi kesalahan pengetikan URL."}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 active:scale-98"
            >
              <Home size={18} />
              <span>{t.notfound_btn_home || "Kembali ke Beranda"}</span>
            </Link>

            <Link
              href="/verified-companies"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all active:scale-98"
            >
              <Search size={18} className="text-blue-600 dark:text-blue-400" />
              <span>{t.notfound_btn_explore || "Jelajahi Perusahaan"}</span>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
