"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, Check } from "lucide-react";

export interface AddressComponentsData {
  street_address: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  onPlaceSelect: (data: AddressComponentsData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    amenity?: string;
    building?: string;
    industrial?: string;
    commercial?: string;
    office?: string;
    suburb?: string;
    village?: string;
    district?: string;
    city_district?: string;
    city?: string;
    county?: string;
    municipality?: string;
    town?: string;
    state?: string;
    province?: string;
    region?: string;
    postcode?: string;
    country?: string;
  };
}

export function AddressAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Ketik nama jalan/gedung, lalu lengkapi Blok/No (misal: Kawasan Marunda Center Blok B No. 21)...",
  className = "",
  disabled = false,
  required = false,
}: AddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState<string>(value || "");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sinkronkan input lokal saat props value dari luar berubah
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Handle klik di luar komponen untuk menutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fungsi pencarian via server proxy API
  const searchPlaces = async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/places/search?q=${encodeURIComponent(trimmed)}`
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data lokasi");
      }

      const data: NominatimResult[] = await response.json();
      setSuggestions(data || []);
      setIsOpen(data && data.length > 0);
    } catch (err) {
      console.warn("OpenStreetMap search error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInputValue(nextVal);
    onChange(nextVal);
    setSelectedItemName(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (nextVal.trim().length >= 3) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(() => {
        searchPlaces(nextVal);
      }, 450);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  // Tangani tombol Enter & Escape agar langsung menutup dropdown saran saat ketik manual
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Helper untuk mengekstrak data dari item OpenStreetMap
  const handleSelect = (item: NominatimResult) => {
    const addr = item.address || {};

    // 1. Tentukan nama jalan / gedung
    const landmark =
      addr.amenity ||
      addr.building ||
      addr.industrial ||
      addr.commercial ||
      addr.office ||
      "";
    const road = addr.road || "";
    const number = addr.house_number ? `No. ${addr.house_number}` : "";

    // Smart Auto-Merge: deteksi nomor, blok, kavling, lantai, atau unit yang sudah diketik user
    const extractSpecifics = (text: string, existing: string) => {
      if (!text) return "";
      const patterns = [
        /\b(?:blok|block)\s+[a-z0-9\/-]+/gi,
        /\b(?:no\.?|nomor)\s*[0-9\/-]+[a-z]?/gi,
        /\b(?:kav\.?|kavling)\s*[a-z0-9\/-]+/gi,
        /\b(?:lt\.?|lantai)\s*[0-9\/-]+/gi,
        /\b(?:unit|suite|ruang)\s*[a-z0-9\/-]+/gi,
        /\brt\.?\s*[0-9]+\s*(?:\/?\s*rw\.?\s*[0-9]+)?\b/gi,
        /\brw\.?\s*[0-9]+\b/gi,
      ];

      const found: string[] = [];
      for (const regex of patterns) {
        const matches = text.match(regex);
        if (matches) {
          for (const m of matches) {
            if (
              !existing.toLowerCase().includes(m.toLowerCase()) &&
              !found.some((t) => t.toLowerCase() === m.toLowerCase())
            ) {
              found.push(m.trim());
            }
          }
        }
      }
      return found.join(" ");
    };

    const userSpecifics = extractSpecifics(inputValue, `${landmark} ${road} ${number}`);

    let street = "";
    if (landmark && road) {
      const landmarkWithSpecifics = userSpecifics ? `${landmark} ${userSpecifics}` : landmark;
      street = `${landmarkWithSpecifics}, ${road} ${number}`.trim().replace(/\s+,/, ",");
    } else if (landmark) {
      const extra = [number, userSpecifics].filter(Boolean).join(" ");
      street = `${landmark} ${extra}`.trim();
    } else if (road) {
      const extra = [number, userSpecifics].filter(Boolean).join(" ");
      street = `${road} ${extra}`.trim();
    } else {
      // Ambil bagian awal dari display name
      const parts = item.display_name.split(",");
      const base = parts[0]?.trim() || "";
      street = userSpecifics ? `${base} ${userSpecifics}` : base;
    }

    // 2. Kecamatan / Kelurahan
    const district =
      addr.city_district || addr.district || addr.suburb || addr.village || "";

    // 3. Kota / Kabupaten
    let city =
      addr.city || addr.municipality || addr.county || addr.town || "";
    if (city.toLowerCase().startsWith("kabupaten ")) {
      city = "Kab. " + city.slice(10);
    }

    // 4. Provinsi
    const province = addr.state || addr.province || addr.region || "";

    // 5. Kode Pos
    const postalCode = addr.postcode || "";

    // 6. Koordinat
    const lat = item.lat ? parseFloat(item.lat) : null;
    const lng = item.lon ? parseFloat(item.lon) : null;

    const parsedData: AddressComponentsData = {
      street_address: street,
      province,
      city,
      district,
      postal_code: postalCode,
      latitude: lat,
      longitude: lng,
    };

    setInputValue(street);
    onChange(street);
    onPlaceSelect(parsedData);
    setSelectedItemName(item.display_name);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-blue-500" />
          ) : (
            <Search size={16} />
          )}
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${className}`}
        />

        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              onChange("");
              setSuggestions([]);
              setIsOpen(false);
              setSelectedItemName(null);
            }}
            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Dropdown Saran Lokasi Otomatis (OpenStreetMap) */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span>Saran Lokasi Resmi (Pilih untuk Auto-Fill)</span>
          </div>

          <ul className="max-h-64 overflow-y-auto">
            {suggestions.map((item) => {
              const parts = item.display_name.split(",");
              const mainTitle = parts[0]?.trim();
              const subTitle = parts.slice(1, 5).join(",").trim();

              return (
                <li key={item.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 dark:hover:bg-slate-800/90 transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <MapPin size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {mainTitle}
                      </div>
                      {subTitle && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {subTitle}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Konfirmasi tempat terpilih & petunjuk penambahan Blok/No */}
      <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400 px-1">
        {selectedItemName && !isOpen ? (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold truncate">
            <Check size={12} className="stroke-[3] shrink-0" />
            <span className="truncate">Lokasi terpilih: {selectedItemName}</span>
          </div>
        ) : (
          <span>Ketik minimal 3 karakter untuk mencari rekomendasi resmi</span>
        )}
        <span className="italic text-slate-400 dark:text-slate-500">
          *Dapat ditambahkan detail Blok / No jika diperlukan
        </span>
      </div>
    </div>
  );
}
