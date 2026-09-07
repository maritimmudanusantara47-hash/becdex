"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation, useLangStore } from "@/store/lang";
import { useCmsStore } from "@/store/cms";
import { Globe, Menu } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export function PublicHeader() {
  const { t, locale } = useTranslation();
  const { setLocale } = useLangStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLangOpenMobile, setIsLangOpenMobile] = useState(false);
  const pathname = usePathname();
  
  const langRef = useRef<HTMLDivElement>(null);
  const langRefMobile = useRef<HTMLDivElement>(null);

  const { fetchContents } = useCmsStore();

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (langRefMobile.current && !langRefMobile.current.contains(event.target as Node)) {
        setIsLangOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header id="header" className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-md py-3.5 md:py-4">
      <div className="container-custom flex items-center justify-between">
        {/* Brand (Left side) */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <Image src="/logo.webp" alt="BECdex Logo" width={34} height={34} className="object-contain" />
          <span className="font-extrabold text-[#012970] text-3xl tracking-tight">BECdex</span>
        </Link>

        {/* Navigation & Actions Grouped on the Right side */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-5 text-sm font-bold">
            <Link
              href="/"
              className={`transition-colors py-1 whitespace-nowrap ${isActive("/") ? "text-[#4154f1]" : "text-[#013289] hover:text-[#4154f1]"}`}
            >
              {t.nav_home}
            </Link>
            <Link
              href="/about"
              className={`transition-colors py-1 whitespace-nowrap ${isActive("/about") ? "text-[#4154f1]" : "text-[#013289] hover:text-[#4154f1]"}`}
            >
              {t.nav_about}
            </Link>
            <Link
              href="/explore"
              className={`transition-colors py-1 whitespace-nowrap ${isActive("/explore") ? "text-[#4154f1]" : "text-[#013289] hover:text-[#4154f1]"}`}
            >
              {t.nav_explore}
            </Link>
            <Link
              href="/verified-companies"
              className={`transition-colors py-1 whitespace-nowrap ${isActive("/verified-companies") ? "text-[#4154f1]" : "text-[#013289] hover:text-[#4154f1]"}`}
            >
              {t.nav_verified_companies}
            </Link>
            <Link
              href="/download"
              className={`transition-colors py-1 whitespace-nowrap ${isActive("/download") ? "text-[#4154f1]" : "text-[#013289] hover:text-[#4154f1]"}`}
            >
              {t.nav_download}
            </Link>
          </nav>

          <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
            {/* Language Selector Dropdown (Desktop) */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#013289] hover:text-[#4154f1] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer select-none border border-transparent hover:border-gray-200"
                aria-label="Select Language"
              >
                <Globe size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">{locale}</span>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden py-1 w-36 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setLocale("en");
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 flex items-center justify-between transition-colors cursor-pointer ${
                      locale === "en" ? "font-bold text-[#4154f1] bg-blue-50/60" : "text-gray-700"
                    }`}
                  >
                    <span>English</span>
                    <span className="text-[10px] uppercase font-mono text-gray-400">EN</span>
                  </button>
                  <button
                    onClick={() => {
                      setLocale("id");
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 flex items-center justify-between transition-colors cursor-pointer ${
                      locale === "id" ? "font-bold text-[#4154f1] bg-blue-50/60" : "text-gray-700"
                    }`}
                  >
                    <span>Indonesia</span>
                    <span className="text-[10px] uppercase font-mono text-gray-400">ID</span>
                  </button>
                </div>
              )}
            </div>

            {/* Login & Registration Buttons */}
            <Link
              href="/login"
              className="bg-[#4154f1] hover:bg-[#5969f3] text-white text-base font-semibold px-5 py-2.5 rounded-md transition-all shadow-xs"
            >
              {t.nav_login}
            </Link>
            <Link
              href="/register"
              className="bg-[#4154f1] hover:bg-[#5969f3] text-white text-base font-semibold px-5 py-2.5 rounded-md transition-all shadow-xs"
            >
              {t.nav_register}
            </Link>
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-3">
          {/* Language Selection Globe for mobile */}
          <div className="relative" ref={langRefMobile}>
            <button
              onClick={() => setIsLangOpenMobile(!isLangOpenMobile)}
              className="flex items-center gap-1 p-1.5 text-[#013289] hover:text-[#4154f1] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              aria-label="Select Language"
            >
              <Globe size={18} />
              <span className="text-xs font-bold uppercase">{locale}</span>
            </button>
            {isLangOpenMobile && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden py-1 w-36 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setLocale("en");
                    setIsLangOpenMobile(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 flex items-center justify-between transition-colors ${
                    locale === "en" ? "font-bold text-[#4154f1] bg-blue-50/60" : "text-gray-700"
                  }`}
                >
                  <span>English</span>
                  <span className="text-[10px] uppercase font-mono text-gray-400">EN</span>
                </button>
                <button
                  onClick={() => {
                    setLocale("id");
                    setIsLangOpenMobile(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 flex items-center justify-between transition-colors ${
                    locale === "id" ? "font-bold text-[#4154f1] bg-blue-50/60" : "text-gray-700"
                  }`}
                >
                  <span>Indonesia</span>
                  <span className="text-[10px] uppercase font-mono text-gray-400">ID</span>
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 space-y-2 mt-2">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.nav_home}</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.nav_about}</Link>
          <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.nav_explore}</Link>
          <Link href="/download" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.nav_download}</Link>
          <hr className="border-gray-100" />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.nav_login}</Link>
          <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.nav_register}</Link>
        </div>
      )}
    </header>
  );
}

