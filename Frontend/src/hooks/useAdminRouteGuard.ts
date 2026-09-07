"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { canManageUsers, canAccessPayments, canVerifySubmissions, canReadSubmissions, canIssueCertificate, isAnyAdmin } from "@/lib/roles";

type GuardType = "super_admin" | "any_admin" | "assessment_admin" | "finance_admin" | "cert_admin" | "submission_reader";

interface UseAdminRouteGuardOptions {
  guard: GuardType;
  /** redirect destination if unauthorized (default: "/admin") */
  redirectTo?: string;
}

/**
 * Hook to protect admin pages from unauthorized role access.
 * Call this at the top of any admin page component.
 * Returns `{ authorized }`.
 *
 * @example
 * const { authorized } = useAdminRouteGuard({ guard: "super_admin" });
 * if (!authorized) return null;
 */
export function useAdminRouteGuard({ guard, redirectTo = "/admin" }: UseAdminRouteGuardOptions) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const isAuthorized = (() => {
    if (!user || !isAuthenticated) return false;
    switch (guard) {
      case "super_admin":
        return canManageUsers(user);
      case "finance_admin":
        return canAccessPayments(user);
      case "assessment_admin":
        return canVerifySubmissions(user);
      case "submission_reader":
        return canReadSubmissions(user);
      case "cert_admin":
        return canIssueCertificate(user);
      case "any_admin":
        return isAnyAdmin(user);
      default:
        return false;
    }
  })();

  useEffect(() => {
    // Only redirect if user data is loaded (isAuthenticated = store is hydrated)
    if (isAuthenticated && !isAuthorized) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isAuthorized, router, redirectTo]);

  return { authorized: isAuthorized };
}
