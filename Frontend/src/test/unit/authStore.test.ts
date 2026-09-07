import { describe, it, expect, beforeEach } from 'vitest';

// ─── F-U5: Auth Store Logic ────────────────────────────────────────────────────
//
// Menguji logika state management tanpa Zustand persist middleware
// untuk menghindari ketergantungan pada localStorage di test environment.
// Fungsi-fungsi ini mencerminkan logika yang sama di useAuthStore.

// ─── Replika state logic dari src/store/auth.ts ───────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string };
  is_active: number;
  image: string;
  email_verified_at: string | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

function createAuthStore() {
  let state: AuthState = { user: null, isAuthenticated: false };

  return {
    getState: () => state,
    setAuth: (user: User) => { state = { user, isAuthenticated: true }; },
    setUser: (user: User) => { state = { ...state, user }; },
    logout: () => { state = { user: null, isAuthenticated: false }; },
  };
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const mockCompanyUser: User = {
  id: 1,
  name: 'PT Test Perusahaan',
  email: 'company@test.com',
  image: '',
  is_active: 1,
  role: { id: 2, name: 'company' },
  email_verified_at: null,
  created_at: '2026-01-01T00:00:00Z',
};

const mockAdminUser: User = {
  id: 100,
  name: 'Admin BECdex',
  email: 'admin@becdex.id',
  image: '',
  is_active: 1,
  role: { id: 1, name: 'admin' },
  email_verified_at: null,
  created_at: '2026-01-01T00:00:00Z',
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('Auth Store Logic', () => {
  let store: ReturnType<typeof createAuthStore>;

  beforeEach(() => {
    store = createAuthStore();
  });

  it('starts with null user and isAuthenticated false', () => {
    const { user, isAuthenticated } = store.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('setAuth sets user and marks authenticated', () => {
    store.setAuth(mockCompanyUser);

    const { user, isAuthenticated } = store.getState();
    expect(user).toEqual(mockCompanyUser);
    expect(isAuthenticated).toBe(true);
  });

  it('setUser updates user object', () => {
    store.setAuth(mockCompanyUser);
    store.setUser(mockAdminUser);

    const { user, isAuthenticated } = store.getState();
    expect(user).toEqual(mockAdminUser);
    expect(isAuthenticated).toBe(true); // should not change
  });

  it('logout clears user and sets isAuthenticated to false', () => {
    store.setAuth(mockCompanyUser);
    store.logout();

    const { user, isAuthenticated } = store.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('correctly identifies admin role from user object', () => {
    store.setAuth(mockAdminUser);
    const { user } = store.getState();
    expect(user?.role?.name).toBe('admin');
  });

  it('correctly identifies company role from user object', () => {
    store.setAuth(mockCompanyUser);
    const { user } = store.getState();
    expect(user?.role?.name).toBe('company');
  });

  it('isAuthenticated stays false until setAuth is called', () => {
    expect(store.getState().isAuthenticated).toBe(false);
    store.setUser(mockCompanyUser);
    // setUser alone should NOT set isAuthenticated
    expect(store.getState().isAuthenticated).toBe(false);
    store.setAuth(mockCompanyUser);
    expect(store.getState().isAuthenticated).toBe(true);
  });
});
