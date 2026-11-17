"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, Search, X, Globe } from "lucide-react";

export interface CountryItem {
  id?: number;
  iso: string;
  name: string;
}

interface CountrySelectProps {
  countries: CountryItem[];
  value: string; // ISO code, e.g. "ID", "US"
  onChange: (value: string) => void;
  locale?: string;
  placeholder?: string;
  error?: boolean;
  triggerClassName?: string;
}

export function CountrySelect({
  countries,
  value,
  onChange,
  locale = "en",
  placeholder,
  error = false,
  triggerClassName,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const defaultPlaceholder = locale === "id" ? "Pilih Negara" : "Select Country";
  const headerTitle = locale === "id" ? "Negara Asal" : "Country";
  const searchPlaceholder = locale === "id" ? "Cari negara atau kode ISO..." : "Search country or ISO code...";
  const notFoundText = locale === "id" ? "Negara tidak ditemukan" : "No country found";

  // Sort alphabetically by country name
  const sorted = useMemo(() => {
    return [...countries].sort((a, b) => a.name.localeCompare(b.name));
  }, [countries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const selected = useMemo(() => {
    if (!value) return null;
    return (
      countries.find(
        (c) =>
          c.iso.toUpperCase() === value.toUpperCase() ||
          c.name.toLowerCase() === value.toLowerCase()
      ) || null
    );
  }, [countries, value]);

  const handleSelect = useCallback(
    (iso: string) => {
      onChange(iso);
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
        <span className={selected ? "text-gray-800 dark:text-slate-100 truncate flex items-center gap-1.5" : "text-gray-400 dark:text-slate-400 truncate"}>
          {selected ? (
            <>
              <span className="font-semibold text-gray-800 dark:text-slate-100">{selected.name}</span>
              <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                {selected.iso}
              </span>
            </>
          ) : (
            placeholder || defaultPlaceholder
          )}
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
              <Globe size={13} className="text-[#0d6efd]" />
              <span className="text-[11px] font-bold text-[#0d6efd] uppercase tracking-wider">
                {headerTitle}
              </span>
            </div>
            {selected && (
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
              filtered.map((c) => {
                const isSelected = selected?.iso === c.iso;
                return (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => handleSelect(c.iso)}
                    className={[
                      "w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-all",
                      isSelected
                        ? "bg-[#0d6efd] text-white font-medium shadow-xs"
                        : "text-gray-700 dark:text-slate-200 hover:bg-blue-50/70 dark:hover:bg-slate-800 hover:text-[#0d6efd]",
                    ].join(" ")}
                  >
                    <span className="truncate">{c.name}</span>
                    <span
                      className={[
                        "text-[10px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0",
                        isSelected
                          ? "bg-white/20 text-white font-bold"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400",
                      ].join(" ")}
                    >
                      {c.iso}
                    </span>
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
