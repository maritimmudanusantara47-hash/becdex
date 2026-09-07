"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext";
import { useAuthStore } from "@/store/auth";
import { useLangStore, useTranslation } from "@/store/lang";
import { useTheme } from "@/context/ThemeContext";
import { Bell, Search, Menu, X, ShieldCheck, Sun, Moon, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
}

interface NotificationItem {
  id: string;
  read_at: string | null;
  created_at: string;
  data: {
    title: string;
    message: string;
    url?: string;
  };
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title }) => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useAuthStore();
  const { locale, setLocale } = useLangStore();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const isAdmin = user?.role?.id && [1, 6, 7, 10, 11].includes(user.role.id);

  const searchableMenu = isAdmin
    ? [
        { label: t.sidebar_admin_dash || "Overview Admin", href: "/admin" },
        { label: t.sidebar_admin_submissions || "Verifikasi Pengajuan", href: "/admin/submissions" },
        { label: t.sidebar_admin_users || "Kelola Pengguna", href: "/admin/users" },
        { label: t.sidebar_admin_payments || "Riwayat Transaksi", href: "/admin/payments" },
        { label: t.sidebar_admin_certificates || "Sertifikat", href: "/admin/certificates" },
        { label: t.sidebar_admin_framework || "Indikator & Kerangka Kerja", href: "/admin/framework" },
        { label: t.sidebar_admin_master || "Data Induk", href: "/admin/master" },
        { label: t.sidebar_admin_profile || "Profil Admin", href: "/admin/profile" },
      ]
    : [
        { label: t.sidebar_company_dash || "Dashboard Perusahaan", href: "/dashboard" },
        { label: t.sidebar_company_submissions || "Pengajuan Sertifikasi (Submissions)", href: "/dashboard/submissions" },
        { label: t.sidebar_company_payments || "Riwayat Pembayaran", href: "/dashboard/payments" },
        { label: t.sidebar_company_guide || "Panduan Pengguna", href: "/dashboard/guide" },
        { label: t.sidebar_company_audit || "Audit Checklist", href: "/dashboard/audit-checklist" },
        { label: t.sidebar_company_profile || "Profil Perusahaan", href: "/dashboard/profile" },
      ];

  const filteredMenu = searchableMenu.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch Notifications
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
    refetchInterval: 30000, // Poll every 30s
  });

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unread_count || 0;

  const markReadMutation = useMutation({
    mutationFn: async (id?: string) => {
      await api.post("/notifications/mark-read", id ? { id } : {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-40 dark:border-slate-800 dark:bg-slate-900/90 shadow-2xs transition-colors">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-3.5">
          {/* Toggle Button */}
          <button
            className="flex items-center justify-center w-10 h-10 text-slate-600 border border-slate-200/80 rounded-xl hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 shadow-2xs"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Mobile Logo / Title */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.webp" alt="BECdex Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-base tracking-tight">
              BECdex
            </span>
          </div>

          {/* Title on Desktop when passed */}
          {title && (
            <div className="hidden lg:flex flex-col ml-1">
              <h1 className="text-lg font-bold text-[#0c2340] dark:text-white tracking-tight flex items-center gap-2">
                {title}
              </h1>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                {t.header_subtitle || "Indeks & Sertifikasi Blue Economy Indonesia"}
              </span>
            </div>
          )}

          {/* Search Box */}
          <div className="hidden sm:block lg:ml-auto w-full max-w-md relative">
            <div className="relative">
              <span className="absolute -translate-y-1/2 left-3.5 top-1/2 pointer-events-none text-slate-400">
                <Search size={16} />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={t.header_search || "Cari submission, indikator, atau dokumen... (Cmd+K)"}
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2 pl-10 pr-12 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-blue-500 transition-all shadow-2xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:border-slate-800 dark:bg-slate-800">
                ⌘K
              </span>
            </div>

            {/* Quick Search Results Dropdown */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 px-3 uppercase">
                  {t.header_search_results?.replace("{count}", String(filteredMenu.length)) || `Hasil Pencarian Menu (${filteredMenu.length})`}
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMenu.length > 0 ? (
                    filteredMenu.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] font-normal text-slate-400">{item.href}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {t.header_search_no_results?.replace("{query}", searchQuery) || `Tidak ada menu atau halaman yang cocok dengan "${searchQuery}"`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center justify-end w-full lg:w-auto shrink-0 gap-2 sm:gap-3 px-4 py-2.5 lg:px-0 lg:py-0 bg-slate-50/50 lg:bg-transparent dark:bg-slate-900/50 lg:ml-4">
          {/* Status badge pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100/80 text-[#0c2340] text-xs font-semibold dark:bg-blue-950/60 dark:border-blue-800/60 dark:text-blue-200 shadow-2xs whitespace-nowrap shrink-0">
            <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{isAdmin ? (t.header_admin || "Verified Administrator") : (t.header_company || "Perusahaan Terdaftar")}</span>
          </div>

          {/* Language Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <button
              onClick={() => setLocale("en")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                locale === "en"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("id")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                locale === "id"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              ID
            </button>
          </div>

          {/* Dark/Light Mode Toggler Button (TailAdmin Style) */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/80 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            aria-label="Toggle Light/Dark Theme"
            title={theme === "dark" ? (t.header_theme_to_light || "Ganti ke Light Mode") : (t.header_theme_to_dark || "Ganti ke Dark Mode")}
          >
            <Sun size={18} className="hidden dark:block text-amber-400" />
            <Moon size={18} className="block dark:hidden text-slate-600" />
          </button>

          {/* Notification Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/80 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{t.header_notif_title || "Notifikasi"}</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        markReadMutation.mutate(undefined);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={14} />
                      {t.header_notif_mark_read || "Tandai Dibaca"}
                    </button>
                  )}
                </div>
                <div className="max-h-87.5 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      {t.header_notif_empty || "Belum ada notifikasi"}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {notifications.map((notif: NotificationItem) => (
                        <div
                          key={notif.id}
                          className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${notif.read_at ? 'opacity-70' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                          onClick={() => {
                            if (!notif.read_at) markReadMutation.mutate(notif.id);
                            if (notif.data.url) window.location.href = notif.data.url;
                          }}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="mt-0.5 shrink-0">
                              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50 mt-1"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mb-0.5">{notif.data.title}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{notif.data.message}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-1.5">{formatDate(notif.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Mini Indicator (Only Photo / Fallback Initials) */}
          <Link
            href={isAdmin ? "/admin/profile" : "/dashboard/profile"}
            className="flex items-center pl-3 border-l border-slate-200/80 dark:border-slate-800 hover:opacity-80 transition-opacity shrink-0"
          >
            {user?.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.image.startsWith("http") ? user.image : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/?$/, '')}/storage/${user.image}`}
                alt={user.name}
                className="w-9 h-9 rounded-xl object-cover shadow-sm border border-slate-200/60 dark:border-slate-850"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#0c2340] to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
