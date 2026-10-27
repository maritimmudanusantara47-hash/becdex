"use client";

import React, { useEffect, useRef, useCallback } from "react";
import type { useRouter } from "next/navigation";
import { driver, Driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslation } from "@/store/lang";
import { useAuthStore } from "@/store/auth";

export interface OnboardingTourProps {
  userId?: number;
  isCompanyUser?: boolean;
  onTourStart?: () => void;
  onTourComplete?: () => void;
}

export function OnboardingTour({
  userId,
  isCompanyUser = true,
  onTourStart,
  onTourComplete,
}: OnboardingTourProps) {
  const { t, locale } = useTranslation();
  const authUser = useAuthStore((s) => s.user);
  const currentUserId = userId ?? authUser?.id;

  const driverInstanceRef = useRef<Driver | null>(null);
  const isRunningRef = useRef(false);

  const getStorageKey = useCallback(() => {
    return currentUserId ? `becdex_onboarding_completed_${currentUserId}` : null;
  }, [currentUserId]);

  const markTourCompleted = useCallback(() => {
    const key = getStorageKey();
    if (key && typeof window !== "undefined") {
      try {
        localStorage.setItem(key, "true");
      } catch (err) {
        console.error("Failed to save tour completion status:", err);
      }
    }
    onTourComplete?.();
  }, [getStorageKey, onTourComplete]);

  // Helper to resolve responsive anchor element
  const resolveTarget = (desktopSelector: string, mobileFallbackSelector?: string): string => {
    if (typeof window === "undefined") return desktopSelector;
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop && mobileFallbackSelector) {
      const mobEl = document.querySelector(mobileFallbackSelector);
      if (mobEl) return mobileFallbackSelector;
    }
    const desktopEl = document.querySelector(desktopSelector);
    if (desktopEl) return desktopSelector;
    return mobileFallbackSelector || desktopSelector;
  };

  const startTour = useCallback(
    (force = false) => {
      if (typeof window === "undefined" || !currentUserId) return;
      if (isRunningRef.current) return;

      const key = getStorageKey();
      if (!force && key) {
        const isCompleted = localStorage.getItem(key);
        if (isCompleted === "true") return;
      }

      // Check if user is company role
      if (!force && !isCompanyUser) return;

      isRunningRef.current = true;
      onTourStart?.();

      const step1Target = resolveTarget(
        '[data-tour="tour-account-verification"]',
        '[data-tour="tour-email-banner"]'
      );
      const step2Target = resolveTarget(
        '[data-tour="tour-nav-profile"]',
        '[data-tour="tour-profile-banner"]'
      );
      const step3Target = '[data-tour="tour-create-submission"]';
      const step4Target = resolveTarget(
        '[data-tour="tour-nav-guide"]',
        '[data-tour="tour-quick-help"]'
      );

      const totalSteps = 4;
      const formatProgress = (current: number) => {
        const template = t.tour_step_indicator || (locale === "id" ? "{current} dari {total}" : "{current} of {total}");
        return template.replace("{current}", String(current)).replace("{total}", String(totalSteps));
      };

      const steps: DriveStep[] = [
        {
          element: step1Target,
          popover: {
            title: `🛡️ ${t.tour_step1_title || "Selamat Datang & Status Akun"}`,
            description:
              t.tour_step1_desc ||
              "Pastikan email akun perusahaan Anda telah terverifikasi. Verifikasi email wajib diselesaikan agar seluruh hak akses dasbor dan pengajuan sertifikasi BECdex terbuka penuh.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: step2Target,
          popover: {
            title: `📋 ${t.tour_step2_title || "Kewajiban Pengisian Profil Perusahaan (100%)"}`,
            description:
              t.tour_step2_desc ||
              "Sebelum membuat pengajuan baru, Anda wajib melengkapi data profil perusahaan hingga 100% (dokumen legalitas NIB/Akta, struktur organisasi, logo perusahaan, dan PIC). Jika belum lengkap, pembuatan pengajuan baru akan diblokir oleh sistem.",
            side: window.innerWidth >= 1024 ? "right" : "bottom",
            align: "start",
          },
        },
        {
          element: step3Target,
          popover: {
            title: `🚀 ${t.tour_step3_title || "Memulai Pengajuan Baru (Create Submission)"}`,
            description:
              t.tour_step3_desc ||
              "Setelah profil perusahaan lengkap 100%, klik tombol ini untuk memulai pengisian kuesioner asesmen 50 indikator ekonomi biru dan mengunggah dokumen bukti pendukung.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: step4Target,
          popover: {
            title: `💡 ${t.tour_step4_title || "Pusat Bantuan & Panduan Sertifikasi"}`,
            description:
              t.tour_step4_desc ||
              "Jika Anda membutuhkan bantuan teknis, pedoman sertifikasi BECdex, atau ingin menghubungi tim dukungan asesor, Anda dapat mengakses menu Panduan Pengguna kapan saja.",
            side: window.innerWidth >= 1024 ? "right" : "top",
            align: "start",
          },
        },
      ];

      const driverObj = driver({
        animate: true,
        smoothScroll: true,
        overlayColor: "rgba(12, 35, 64, 0.72)",
        overlayOpacity: 0.8,
        stagePadding: 8,
        stageRadius: 16,
        allowClose: true,
        showProgress: true,
        popoverClass: "becdex-tour-popover",
        nextBtnText: t.tour_btn_next || (locale === "id" ? "Selanjutnya" : "Next"),
        prevBtnText: t.tour_btn_prev || (locale === "id" ? "Sebelumnya" : "Back"),
        doneBtnText: t.tour_btn_done || (locale === "id" ? "Selesai" : "Finish"),
        steps,
        onCloseClick: () => {
          markTourCompleted();
          driverObj.destroy();
        },
        onDoneClick: () => {
          markTourCompleted();
          driverObj.destroy();
        },
        onPopoverRender: (popover, { driver: currentDriver, index }) => {
          const currentStep = (index ?? 0) + 1;

          // Format progress badge and position it above the title so it never gets compressed
          if (popover.progress) {
            popover.progress.textContent = formatProgress(currentStep);
            popover.progress.style.setProperty("white-space", "nowrap", "important");
            popover.progress.style.setProperty("display", "inline-flex", "important");
            popover.progress.style.setProperty("width", "fit-content", "important");
            popover.progress.style.setProperty("flex-shrink", "0", "important");
            popover.progress.style.setProperty("margin-bottom", "8px", "important");
            popover.progress.style.setProperty("line-height", "1.2", "important");

            // Move badge above title to give it its own dedicated line
            if (popover.title && popover.progress.parentElement !== popover.wrapper) {
              popover.wrapper.insertBefore(popover.progress, popover.title);
            }
          }

          // Ensure Next / Done button has vibrant blue / green styling and white text (prevent white-on-white)
          if (popover.nextButton) {
            const isLastStep = currentStep === totalSteps;
            popover.nextButton.style.setProperty(
              "background-color",
              isLastStep ? "#059669" : "#2563eb",
              "important"
            );
            popover.nextButton.style.setProperty(
              "background-image",
              isLastStep
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              "important"
            );
            popover.nextButton.style.setProperty("color", "#ffffff", "important");
            popover.nextButton.style.setProperty("font-weight", "700", "important");
            popover.nextButton.style.setProperty("border", "none", "important");
            popover.nextButton.style.setProperty("border-radius", "10px", "important");
            popover.nextButton.style.setProperty("padding", "7px 16px", "important");
            popover.nextButton.style.setProperty("white-space", "nowrap", "important");
            popover.nextButton.style.setProperty(
              "box-shadow",
              isLastStep
                ? "0 4px 10px rgba(16, 185, 129, 0.25)"
                : "0 4px 10px rgba(37, 99, 235, 0.25)",
              "important"
            );
            popover.nextButton.style.setProperty("cursor", "pointer", "important");
            popover.nextButton.style.setProperty("display", "inline-flex", "important");
            popover.nextButton.style.setProperty("align-items", "center", "important");
            popover.nextButton.style.setProperty("justify-content", "center", "important");
          }

          // Ensure Previous button is properly styled
          if (popover.previousButton) {
            popover.previousButton.style.setProperty("font-weight", "600", "important");
            popover.previousButton.style.setProperty("border-radius", "10px", "important");
            popover.previousButton.style.setProperty("white-space", "nowrap", "important");
            popover.previousButton.style.setProperty("padding", "7px 14px", "important");
          }

          // Ensure close button click explicitly destroys driver
          if (popover.closeButton) {
            popover.closeButton.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              markTourCompleted();
              currentDriver.destroy();
            };
          }

          // Add customized "Skip Tour" link button in footer if not the last step
          const existingSkipBtn = popover.footer.querySelector(".tour-custom-skip-btn");
          if (!existingSkipBtn && currentStep < totalSteps) {
            const skipBtn = document.createElement("button");
            skipBtn.className = "tour-custom-skip-btn";
            skipBtn.type = "button";
            skipBtn.textContent = t.tour_btn_skip || (locale === "id" ? "Lewati Panduan" : "Skip Tour");
            skipBtn.style.cssText =
              "all: unset; cursor: pointer; font-size: 11px; font-weight: 600; color: #94a3b8; padding: 6px 10px; border-radius: 8px; transition: color 0.2s, background 0.2s; margin-right: auto; white-space: nowrap;";
            skipBtn.onmouseenter = () => {
              skipBtn.style.color = "#ef4444";
              skipBtn.style.background = "rgba(239, 68, 68, 0.08)";
            };
            skipBtn.onmouseleave = () => {
              skipBtn.style.color = "#94a3b8";
              skipBtn.style.background = "transparent";
            };
            skipBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              markTourCompleted();
              currentDriver.destroy();
            };

            // Insert skip button before the navigation buttons
            if (popover.footerButtons) {
              popover.footer.insertBefore(skipBtn, popover.footerButtons);
            } else {
              popover.footer.appendChild(skipBtn);
            }
          }
        },
        onDestroyed: () => {
          markTourCompleted();
          isRunningRef.current = false;
          driverInstanceRef.current = null;
        },
      });

      driverInstanceRef.current = driverObj;
      driverObj.drive();
    },
    [
      currentUserId,
      getStorageKey,
      isCompanyUser,
      locale,
      markTourCompleted,
      onTourStart,
      t,
    ]
  );

  // Check for auto-trigger on page load or when search query ?tour=start is present
  useEffect(() => {
    if (!currentUserId || typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const tourParam = urlParams.get("tour");
    const shouldForceFromParam = tourParam === "start" || tourParam === "1" || tourParam === "true";

    // Check sessionStorage flag as well (for cross-page navigation e.g. from Guide page)
    const shouldForceFromSession = sessionStorage.getItem("becdex_restart_tour") === "1";

    if (shouldForceFromParam || shouldForceFromSession) {
      sessionStorage.removeItem("becdex_restart_tour");

      // Clean query parameter gracefully
      const url = new URL(window.location.href);
      url.searchParams.delete("tour");
      window.history.replaceState({}, "", url.pathname + url.search);

      const timer = setTimeout(() => {
        startTour(true);
      }, 400);
      return () => clearTimeout(timer);
    }

    // Default auto start for first-time visitors
    const timer = setTimeout(() => {
      startTour(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [currentUserId, startTour]);

  // Expose global restart trigger for external components (e.g. settings/guide buttons)
  useEffect(() => {
    const handleCustomRestart = () => {
      startTour(true);
    };

    window.addEventListener("becdex:restart-onboarding-tour", handleCustomRestart);
    return () => {
      window.removeEventListener("becdex:restart-onboarding-tour", handleCustomRestart);
    };
  }, [startTour]);

  return null;
}

/**
 * Utility helper to restart the onboarding tour from any page or component
 */
export function restartOnboardingTour(router?: ReturnType<typeof useRouter>) {
  if (typeof window === "undefined") return;

  const isDashboard = window.location.pathname === "/dashboard";
  if (isDashboard) {
    window.dispatchEvent(new CustomEvent("becdex:restart-onboarding-tour"));
  } else {
    sessionStorage.setItem("becdex_restart_tour", "1");
    if (router) {
      router.push("/dashboard?tour=start");
    } else {
      window.location.href = "/dashboard?tour=start";
    }
  }
}

export default OnboardingTour;
