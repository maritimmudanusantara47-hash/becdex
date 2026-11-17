"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { getSectorLabel, SectorLookupItem } from "@/constants/sectors";

interface SectorSelectProps {
  sectors: SectorLookupItem[];
  value: string; // sector id as string
  onChange: (value: string) => void;
  locale: string;
  placeholder?: string;
  error?: boolean;
  triggerClassName?: string;
}

export function SectorSelect({
  sectors,
  value,
  onChange,
  locale,
  placeholder,
  error = false,
  triggerClassName,
}: SectorSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const defaultPlaceholder = locale === "id" ? "Pilih Sektor Usaha" : "Select Sector";
  const headerTitle = locale === "id" ? "Sektor Ekonomi Biru" : "Blue Economic Sector";
  const searchPlaceholder = locale === "id" ? "Cari sektor..." : "Search sector...";
  const notFoundText = locale === "id" ? "Sektor tidak ditemukan" : "No sector found";

  const sorted = [...sectors].sort((a, b) => a.name.localeCompare(b.name));

  const filtered = sorted.filter((s) =>
    getSectorLabel(s, locale).toLowerCase().includes(search.toLowerCase())
  );

  const selected = sectors.find((s) => String(s.id) === value);
  const selectedLabel = selected ? getSectorLabel(selected, locale) : null;

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={
          triggerClassName
            ? [
                triggerClassName,
                error
                  ? "border-red-400 focus:ring-2 focus:ring-red-200"
                  : open
                  ? "border-[#0d6efd] ring-2 ring-[#0d6efd]/20"
                  : "",
              ].join(" ")
            : [
                "w-full flex items-center justify-between gap-2 text-xs rounded-lg px-3 py-2 bg-white border outline-none transition-all",
                error
                  ? "border-red-400 focus:ring-2 focus:ring-red-200"
                  : open
                  ? "border-[#0d6efd] ring-2 ring-[#0d6efd]/20"
                  : "border-gray-300 hover:border-gray-400",
              ].join(" ")
        }
      >
        <span className={selectedLabel ? "text-gray-800 dark:text-slate-100 truncate" : "text-gray-400 dark:text-slate-400 truncate"}>
          {selectedLabel ?? (placeholder || defaultPlaceholder)}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header label - distinct from selectable items */}
          <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border-b border-blue-100/60 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d6efd]"></span>
              <span className="text-[11px] font-bold text-[#0d6efd] uppercase tracking-wider">
                {headerTitle}
              </span>
            </div>
            {selectedLabel && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-[11px] flex items-center gap-0.5"
                title="Clear selection"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="p-2 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/70 rounded-lg px-2.5 py-1.5 border border-gray-100 dark:border-slate-700">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-xs text-gray-700 dark:text-slate-200 outline-none placeholder:text-gray-400"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <X size={12} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-gray-50 dark:divide-slate-800/50">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-4">{notFoundText}</p>
            ) : (
              filtered.map((s) => {
                const label = getSectorLabel(s, locale);
                const isSelected = String(s.id) === value;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelect(String(s.id))}
                    className={[
                      "w-full text-left px-3 py-2.5 text-xs flex items-center gap-2.5 transition-all",
                      isSelected
                        ? "bg-[#0d6efd] text-white font-medium shadow-xs"
                        : "text-gray-700 dark:text-slate-200 hover:bg-blue-50/70 dark:hover:bg-slate-800 hover:text-[#0d6efd]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "w-2 h-2 rounded-full shrink-0 transition-colors",
                        isSelected ? "bg-white" : "bg-blue-300 dark:bg-slate-600",
                      ].join(" ")}
                    />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
