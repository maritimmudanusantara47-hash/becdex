"use client";

import { useLangStore } from "@/store/lang";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLangStore();

  return (
    <div className={`inline-flex items-center gap-1 bg-gray-200/80 p-1 rounded-lg text-xs font-semibold select-none ${className}`}>
      <Globe size={14} className="text-gray-500 ml-1 mr-0.5" />
      <button
        type="button"
        onClick={() => setLocale("id")}
        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
          locale === "id"
            ? "bg-white text-[#0d6efd] shadow-xs font-bold"
            : "text-gray-600 hover:text-gray-900"
        }`}
        aria-label="Switch to Indonesian"
      >
        ID
      </button>
      <span className="text-gray-300">|</span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
          locale === "en"
            ? "bg-white text-[#0d6efd] shadow-xs font-bold"
            : "text-gray-600 hover:text-gray-900"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;
