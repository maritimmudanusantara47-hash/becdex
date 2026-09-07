"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { Backdrop } from "./Backdrop";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { ChevronRight, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import api from "@/lib/api";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

function AppLayoutInner({ children, title }: AppLayoutProps) {
  const { isExpanded, isHovered } = useSidebar();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Re-fetch user on mount to ensure we have the latest status (like email_verified_at)
    api.get("/auth/me")
      .then((res) => {
        if (res.data?.data) {
          setUser(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to refetch user data", err);
      });
  }, [setUser]);

  const sidebarWidthClass =
    isExpanded || isHovered ? "lg:ml-72.5" : "lg:ml-22.5";

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar />
      <Backdrop />

      {/* Main Content Area with Dynamic Margin for Fixed Sidebar */}
      <div
        className={cn(
          "relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out min-w-0",
          sidebarWidthClass
        )}
      >
        <AppHeader title={title} />

        {/* Page Content */}
        <main className="grow">
          {user && !user.email_verified_at && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 px-4 md:px-6 lg:px-8 py-3 w-full">
              <div className="mx-auto max-w-screen-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-full text-amber-600 dark:text-amber-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      Verifikasi Email Anda
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">
                      Demi keamanan, Anda perlu memverifikasi email <strong>{user.email}</strong> sebelum dapat mengajukan sertifikasi.
                    </p>
                  </div>
                </div>
                <Link 
                  href="/verify-email" 
                  className="shrink-0 flex items-center gap-1 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md transition-colors"
                >
                  Verifikasi Sekarang <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 lg:p-8 space-y-6">
            {children}
          </div>
        </main>

        {/* TailAdmin Maritime Footer */}
        <footer className="mt-auto px-6 py-4 bg-white/60 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800/60 text-center sm:flex sm:justify-between sm:text-left text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-bold text-[#0c2340] dark:text-blue-400">BECdex</span>. All rights reserved.
          </p>
          <p className="mt-1 sm:mt-0 font-medium">
            Blue Economy Company Index &bull; <span className="text-blue-600 dark:text-blue-400">Maritim Muda Nusantara</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutInner title={title}>{children}</AppLayoutInner>
    </SidebarProvider>
  );
}
