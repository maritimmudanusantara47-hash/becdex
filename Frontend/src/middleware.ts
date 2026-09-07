import { NextRequest, NextResponse } from "next/server";


// Role IDs yang termasuk admin — harus sinkron dengan Backend/app/Enums/RoleId.php
const ADMIN_ROLE_IDS = [1, 6, 7, 10, 11, 12];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token      = request.cookies.get("becdex_session")?.value;
  const roleCookie = request.cookies.get("becdex_role")?.value;
  const roleId     = roleCookie ? parseInt(roleCookie, 10) : null;

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

  // Tidak login → redirect ke login untuk route protected (/admin, /dashboard)
  if (!token) {
    if (isProtectedRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }


  // Sudah login — jika mencoba akses auth route (/login atau /register), redirect ke dashboard/admin
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  if (isAuthRoute) {
    if (roleId !== null && ADMIN_ROLE_IDS.includes(roleId)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Sudah login — cek role separation (UX guard; API tetap enforce 403)
  if (roleId !== null) {
    const isAdmin   = ADMIN_ROLE_IDS.includes(roleId);
    const isCompany = roleId === 2;

    // Company mencoba akses /admin/* → redirect ke dashboard
    if (isCompany && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Admin mencoba akses /dashboard/* → redirect ke admin
    if (isAdmin && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)" ],
};
