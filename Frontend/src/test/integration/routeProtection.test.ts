import { describe, it, expect } from 'vitest';

// ─── F-I7: Middleware Route Protection ────────────────────────────────────────
//
// Mendokumentasikan aturan middleware dari Next.js middleware.ts
// Route protection logic diuji sebagai pure function.

// Replika logika dari src/middleware.ts
const PUBLIC_ROUTES = ['/', '/login', '/register', '/verified-companies', '/about', '/explore'];
const AUTH_ROUTES   = ['/login', '/register'];
const ADMIN_ROUTES  = ['/admin'];

function shouldRedirect(pathname: string, hasCookie: boolean, userRole: 'company' | 'admin' | null): {
  redirect: string | null;
  reason: string;
} {
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
  const isAuthRoute = AUTH_ROUTES.some(r => pathname === r);
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r));
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Tidak ada cookie / tidak login
  if (!hasCookie) {
    if (!isPublic) {
      return { redirect: `/login?from=${pathname}`, reason: 'unauthenticated access to protected route' };
    }
    return { redirect: null, reason: 'public route, no redirect' };
  }

  // Sudah login, akses halaman auth (login/register)
  if (hasCookie && isAuthRoute) {
    const dest = userRole === 'admin' ? '/admin' : '/dashboard';
    return { redirect: dest, reason: 'already authenticated, redirect away from auth route' };
  }

  // Company mencoba akses admin
  if (hasCookie && userRole === 'company' && isAdminRoute) {
    return { redirect: '/dashboard', reason: 'company cannot access admin routes' };
  }

  // Admin mencoba akses dashboard company
  if (hasCookie && userRole === 'admin' && isDashboardRoute) {
    return { redirect: '/admin', reason: 'admin should use admin routes' };
  }

  return { redirect: null, reason: 'allowed' };
}

// ─── F-I7 Tests ───────────────────────────────────────────────────────────────

describe('F-I7: Middleware Route Protection', () => {

  // ─── Unauthenticated ────────────────────────────────────────────────────────

  it('F-I7-01: Tanpa cookie, akses /dashboard → redirect ke /login?from=/dashboard', () => {
    const result = shouldRedirect('/dashboard', false, null);
    expect(result.redirect).toBe('/login?from=/dashboard');
  });

  it('Tanpa cookie, akses /dashboard/submissions → redirect ke login', () => {
    const result = shouldRedirect('/dashboard/submissions', false, null);
    expect(result.redirect).toContain('/login');
  });

  it('Tanpa cookie, akses /admin → redirect ke login', () => {
    const result = shouldRedirect('/admin', false, null);
    expect(result.redirect).toContain('/login');
  });

  it('F-I7-02: Tanpa cookie, akses /login → tidak redirect', () => {
    const result = shouldRedirect('/login', false, null);
    expect(result.redirect).toBeNull();
  });

  it('F-I7-03: Tanpa cookie, akses /verified-companies → tidak redirect (public)', () => {
    const result = shouldRedirect('/verified-companies', false, null);
    expect(result.redirect).toBeNull();
  });

  it('Tanpa cookie, akses / (homepage) → tidak redirect', () => {
    const result = shouldRedirect('/', false, null);
    expect(result.redirect).toBeNull();
  });

  // ─── Authenticated Company ──────────────────────────────────────────────────

  it('F-I7-04: Dengan cookie company, akses /dashboard → tidak redirect', () => {
    const result = shouldRedirect('/dashboard', true, 'company');
    expect(result.redirect).toBeNull();
  });

  it('Company dengan cookie, akses /login → redirect ke /dashboard', () => {
    const result = shouldRedirect('/login', true, 'company');
    expect(result.redirect).toBe('/dashboard');
  });

  it('Company dengan cookie, akses /register → redirect ke /dashboard', () => {
    const result = shouldRedirect('/register', true, 'company');
    expect(result.redirect).toBe('/dashboard');
  });

  it('Company dengan cookie, akses /admin → redirect ke /dashboard', () => {
    const result = shouldRedirect('/admin', true, 'company');
    expect(result.redirect).toBe('/dashboard');
  });

  // ─── Authenticated Admin ────────────────────────────────────────────────────

  it('Admin dengan cookie, akses /admin → tidak redirect', () => {
    const result = shouldRedirect('/admin', true, 'admin');
    expect(result.redirect).toBeNull();
  });

  it('Admin dengan cookie, akses /login → redirect ke /admin', () => {
    const result = shouldRedirect('/login', true, 'admin');
    expect(result.redirect).toBe('/admin');
  });

  it('Admin dengan cookie, akses /dashboard → redirect ke /admin', () => {
    const result = shouldRedirect('/dashboard', true, 'admin');
    expect(result.redirect).toBe('/admin');
  });
});

// ─── F-I3: Dashboard Company State Logic ──────────────────────────────────────

describe('F-I3: Dashboard Company — State Logic', () => {

  const noSubmission = null;
  const draftSubmission = { id: 'sub-1', status: { id: 2, name: 'Document Submission', color: 'info' } };
  const certifiedSubmission = { id: 'sub-2', status: { id: 5, name: 'Certified', color: 'success' } };

  function getDashboardState(submission: typeof draftSubmission | null) {
    return {
      showStartPrompt:    submission === null,
      showActiveStatus:   submission !== null,
      isCertified:        submission?.status.id === 5,
      showPaymentCTA:     submission?.status.id === 8,
    };
  }

  it('F-I3-02: Tanpa submission — tampilkan prompt "Mulai Pengajuan"', () => {
    const state = getDashboardState(noSubmission);
    expect(state.showStartPrompt).toBe(true);
    expect(state.showActiveStatus).toBe(false);
  });

  it('F-I3-01: Ada submission aktif — tampilkan status, tidak tampilkan prompt', () => {
    const state = getDashboardState(draftSubmission);
    expect(state.showActiveStatus).toBe(true);
    expect(state.showStartPrompt).toBe(false);
  });

  it('F-I3-03: Submission certified — isCertified true', () => {
    const state = getDashboardState(certifiedSubmission);
    expect(state.isCertified).toBe(true);
    expect(state.showActiveStatus).toBe(true);
  });
});
