"use client";

import { useLangStore } from "@/store/lang";

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { locale, setLocale } = useLangStore();

  return (
    <div
      className={`inline-flex items-center bg-gray-100/90 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
          locale === "en"
            ? "bg-white dark:bg-gray-700 text-[#0d6efd] dark:text-blue-400 shadow-xs"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("id")}
        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
          locale === "id"
            ? "bg-white dark:bg-gray-700 text-[#0d6efd] dark:text-blue-400 shadow-xs"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        ID
      </button>
    </div>
  );
}

