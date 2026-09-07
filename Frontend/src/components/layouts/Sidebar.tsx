"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

import { useAuthStore } from "@/store/auth";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import api, { setAuthToken } from "@/lib/api";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  LogOut,
  Users,
  Settings,
  GitBranch,
  Globe,
  Award,
  Mail,
  Download,
  Compass,
  ChevronRight,
  MoreHorizontal,
  Building2,
  FileCheck,
  BookOpen,
  ClipboardList,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  roles?: number[];
};

import { useTranslation } from "@/store/lang";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await api.delete("/auth/logout");
    } catch (error) {
      console.error("Logout failed on backend:", error);
    }
    logout();
    Cookies.remove("becdex_role");
    Cookies.remove("becdex_session"); // hapus session cookie
    localStorage.removeItem("becdex_token"); // hapus token dari localStorage
    localStorage.removeItem("becdex_remember");
    setAuthToken(null);
    setShowLogoutModal(false);
    sessionStorage.setItem("logout_success", "1");
    window.location.href = "/login";
  };

  const COMPANY_MAIN_MENU: NavItem[] = [
    { label: t.sidebar_company_dash || "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: t.sidebar_company_submissions || "Submissions", href: "/dashboard/submissions", icon: FileText },
    { label: t.sidebar_company_payments || "Payment History", href: "/dashboard/payments", icon: CreditCard },
  ];

  const COMPANY_OTHERS_MENU: NavItem[] = [
    { label: t.sidebar_company_guide || "Panduan Pengguna", href: "/dashboard/guide", icon: BookOpen },
    { label: t.sidebar_company_audit || "Audit Checklist", href: "/dashboard/audit-checklist", icon: ClipboardList },
    { label: t.sidebar_company_profile || "Profil Perusahaan", href: "/dashboard/profile", icon: Building2 },
  ];

  const ADMIN_MAIN_MENU: NavItem[] = [
    { label: t.sidebar_admin_dash || "Overview Admin", href: "/admin", icon: LayoutDashboard },
    // Submissions: Super Admin + IT Manager + QC Admin + Assessment Admin + Certificate Admin
    { label: t.sidebar_admin_submissions || "Verifikasi Submission", href: "/admin/submissions", icon: FileCheck, badge: "New", badgeColor: "bg-blue-100 text-blue-700", roles: [1, 6, 7, 11, 12] },
    // Users: hanya Super Admin + IT Manager
    { label: t.sidebar_admin_users || "Kelola Pengguna", href: "/admin/users", icon: Users, roles: [1, 12] },
    // Payments: Super Admin + IT Manager + Finance Admin + QC Admin
    { label: t.sidebar_admin_payments || "Riwayat Transaksi", href: "/admin/payments", icon: CreditCard, roles: [1, 10, 11, 12] },
    // Certificates: semua admin
    { label: t.sidebar_admin_certificates || "Sertifikat", href: "/admin/certificates", icon: Award },
  ];

  const ADMIN_SYSTEM_MENU: NavItem[] = [
    // Framework: Super Admin + IT Manager + QC Admin
    { label: t.sidebar_admin_framework || "Indikator & Framework", href: "/admin/framework", icon: GitBranch, roles: [1, 11, 12] },
    // Master Data: Super Admin + IT Manager + QC Admin
    { label: t.sidebar_admin_master || "Master Data", href: "/admin/master", icon: Globe, roles: [1, 11, 12] },
    // Help: semua admin
    { label: t.sidebar_admin_help || "Inbox Bantuan", href: "/admin/help", icon: Mail, roles: [1, 11, 6, 12] },
    // Downloads: Super Admin + IT Manager + QC Admin
    { label: t.sidebar_admin_downloads || "Kelola Unduhan", href: "/admin/downloads", icon: Download, roles: [1, 11, 12] },
    // CMS: Super Admin + IT Manager + QC Admin
    { label: t.sidebar_admin_content || "Kelola Konten Web", href: "/admin/content", icon: FileText, roles: [1, 11, 12] },
    // Profil: semua admin
    { label: t.sidebar_admin_profile || "Profil Admin", href: "/admin/profile", icon: Building2 },
    // Settings: Super Admin + IT Manager
    { label: t.sidebar_admin_settings || "Pengaturan Sistem", href: "/admin/settings", icon: Settings, roles: [1, 12] },
  ];

  const roleId = user?.role?.id;
  const filterByRole = (menu: NavItem[]) => {
    if (!roleId) return [];
    return menu.filter(item => !item.roles || item.roles.includes(roleId));
  };

  // Semua role selain Company (2) dianggap admin dan diarahkan ke admin panel
  const isAdmin = roleId && [1, 6, 7, 10, 11, 12].includes(roleId);
  const mainMenu = isAdmin ? filterByRole(ADMIN_MAIN_MENU) : COMPANY_MAIN_MENU;
  const secondaryMenu = isAdmin ? filterByRole(ADMIN_SYSTEM_MENU) : COMPANY_OTHERS_MENU;
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";

  const showFullText = isExpanded || isHovered || isMobileOpen;

  const checkIsActive = useCallback(
    (href: string, label: string) => {
      if (href === "/admin" || href === "/dashboard") {
        return pathname === href;
      }
      if ((label === (t.sidebar_company_submissions || "Submissions") || label === "Submissions") && href === "/dashboard/submissions") {
        return pathname.startsWith("/dashboard/submissions");
      }
      return pathname.startsWith(href);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  );

  const renderNavGroup = (items: NavItem[], title: string) => (
    <div className="mb-6">
      <h2
        className={cn(
          "mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-all duration-200 flex items-center",
          !showFullText ? "justify-center" : "px-3 justify-start"
        )}
      >
        {showFullText ? title : <MoreHorizontal size={18} />}
      </h2>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = checkIsActive(item.href, item.label);

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 cursor-pointer",
                  !showFullText ? "justify-center px-3" : "justify-start",
                  active
                    ? "bg-blue-50/90 text-blue-700 font-bold shadow-2xs dark:bg-blue-600/20 dark:text-blue-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                )}
              >
                {/* Active Indicator Bar on left edge when full text shown */}
                {active && showFullText && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                )}

                <span
                  className={cn(
                    "flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shrink-0",
                    active ? "text-blue-300 dark:text-white" : "text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                </span>

                {showFullText && (
                  <span className="truncate flex-1 tracking-tight">{item.label}</span>
                )}

                {showFullText && item.badge && (
                  <span
                    className={cn(
                      "ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase",
                      item.badgeColor || "bg-blue-100 text-blue-700"
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {!showFullText && active && (
                  <span className="absolute right-1.5 top-1.5 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <aside
      className={cn(
        "fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 h-screen transition-all duration-300 ease-in-out z-50 shadow-xs",
        showFullText ? "w-72.5 px-5" : "w-22.5 px-3",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "py-6 flex items-center border-b border-slate-100 dark:border-slate-800/60 mb-4 transition-all duration-300",
          !showFullText ? "justify-center" : "justify-between px-1"
        )}
      >
        <Link href={dashboardHref} className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="BECdex Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
          </div>
          {showFullText && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-[#0c2340] dark:text-white tracking-tight leading-none">
                  BECdex
                </span>
                <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                  INDEX
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1 truncate">
                {isAdmin ? "Admin Portal" : "Blue Economy Portal"}
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar pr-1">
        <nav className="shrink-0">
          {renderNavGroup(mainMenu, t.sidebar_group_main || "Main Navigation")}
          {renderNavGroup(secondaryMenu, isAdmin ? (t.sidebar_group_system || "Sistem & Pengaturan") : (t.sidebar_group_other || "Menu Lainnya"))}
        </nav>

        {showFullText && (
          <div className="mt-auto mb-6 mx-1 p-4 shrink-0 rounded-2xl bg-linear-to-br from-blue-50/80 via-indigo-50/50 to-blue-100/50 dark:from-[#0c2340] dark:via-blue-900 dark:to-blue-800 text-slate-800 dark:text-white shadow-md shadow-blue-900/5 dark:shadow-blue-950/20 relative overflow-hidden border border-blue-200/80 dark:border-blue-700/40 transition-colors">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
            <Compass size={28} className="text-blue-600 dark:text-blue-300 mb-2.5 opacity-90" />
            <h4 className="text-sm font-bold tracking-tight mb-1 text-slate-900 dark:text-white">
              {isAdmin ? (t.sidebar_admin_card_title || "Sistem BECdex v2.0") : (t.sidebar_company_card_title || "Maritim Muda Nusantara")}
            </h4>
            <p className="text-xs text-slate-600 dark:text-blue-200/90 leading-relaxed mb-3">
              {isAdmin
                ? (t.sidebar_admin_card_desc || "Portal pengelola dan verifikator indeks ekonomi biru nasional.")
                : (t.sidebar_company_card_desc || "Tingkatkan standar kelestarian laut & ekonomi perusahaan Anda.")}
            </p>
            <Link
              href={isAdmin ? "/admin/settings" : "/dashboard/submissions"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white px-3 py-1.5 rounded-lg backdrop-blur-xs transition-colors shadow-xs"
            >
              <span>{isAdmin ? (t.sidebar_card_btn_settings || "Pengaturan") : (t.sidebar_card_btn_apply || "Ajukan Indeks")}</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* User Profile & Logout Footer */}
      <div
        className={cn(
          "border-t border-slate-100 dark:border-slate-800/80 py-4 mt-auto transition-all duration-300",
          !showFullText ? "px-1 text-center" : "px-2"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-2.5",
            !showFullText ? "justify-center p-1.5" : ""
          )}
        >
          {user?.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.image.startsWith("http") ? user.image : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/?$/, '')}/storage/${user.image}`}
              alt={user.name}
              className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-xs border border-blue-400/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#0c2340] text-blue-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-blue-400/20">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          {showFullText && (
            <div className="min-w-0 flex-1">
              <p className="text-slate-800 dark:text-slate-200 text-xs font-bold truncate leading-none mb-1">
                {user?.name ?? (t.sidebar_user_default || "Pengguna")}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] truncate font-mono leading-none">
                {user?.email ?? "—"}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          title={t.sidebar_logout || "Logout"}
          className={cn(
            "w-full flex items-center justify-center gap-2.5 rounded-xl py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 text-xs font-semibold transition-all duration-200 cursor-pointer border border-transparent hover:border-red-200/50 dark:hover:border-red-900/50",
            !showFullText ? "px-0" : "px-3"
          )}
        >
          <LogOut size={16} strokeWidth={2} />
          {showFullText && <span>{t.sidebar_logout || "Logout"}</span>}
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-9999 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 mx-auto">
              <LogOut size={24} />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">
              {t.sidebar_logout_title || "Konfirmasi Keluar"}
            </h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
              {t.sidebar_logout_desc || "Apakah Anda yakin ingin keluar dari sistem? Anda harus masuk kembali untuk mengakses dasbor."}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                {t.sidebar_logout_cancel || "Batal"}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors text-sm shadow-md shadow-red-600/20"
              >
                {t.sidebar_logout_confirm || "Ya, Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
