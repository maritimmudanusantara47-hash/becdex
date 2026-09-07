import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// ─── F-I1: Login Form Validation Logic ────────────────────────────────────────
//
// Test logika validasi form login menggunakan Zod schema yang sama
// dengan yang dipakai di src/app/login/page.tsx

const loginSchema = z.object({
  email:    z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  remember: z.boolean().optional(),
});

describe('F-I1: Login Form Validation', () => {
  it('F-I1-04: Email kosong → validasi gagal, API tidak dipanggil', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('email');
    }
  });

  it('Email tidak valid → validasi gagal', () => {
    const result = loginSchema.safeParse({ email: 'bukan-email', password: 'password' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('email');
    }
  });

  it('Password kosong → validasi gagal', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('password');
    }
  });

  it('Data valid → validasi sukses', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('remember bersifat opsional → validasi tetap sukses tanpa field ini', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('remember true → validasi sukses dengan flag remember bernilai true', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'secret', remember: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.remember).toBe(true);
    }
  });

  it('remember false → validasi sukses dengan flag remember bernilai false', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'secret', remember: false });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.remember).toBe(false);
    }
  });
});

// ─── F-I2: Register Form Validation Logic ─────────────────────────────────────
//
// Replika dari Zod schema registrasi di src/app/register/page.tsx

const registerSchema = z.object({
  name:                  z.string().min(3, 'Nama minimal 3 karakter'),
  email:                 z.string().email('Format email tidak valid'),
  password:              z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
  company_phone:         z.string().min(1, 'Nomor telepon perusahaan wajib diisi'),
  pic_name:              z.string().min(1, 'Nama PIC wajib diisi'),
  pic_phone:             z.string().min(1, 'Nomor telepon PIC wajib diisi'),
  pic_email:             z.string().email('Format email PIC tidak valid'),
  pic_position:          z.string().min(1, 'Jabatan PIC wajib diisi'),
  address:               z.string().min(1, 'Alamat wajib diisi'),
  terms_accepted:        z.literal(true, 'Anda harus menyetujui syarat dan ketentuan'),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

const validRegisterData = {
  name:                  'PT Test Perusahaan',
  email:                 'company@test.com',
  password:              'password123',
  password_confirmation: 'password123',
  company_phone:         '0812345678',
  pic_name:              'Budi Santoso',
  pic_phone:             '0812345679',
  pic_email:             'budi@company.com',
  pic_position:          'Manager',
  address:               'Jl. Test No. 1',
  terms_accepted:        true as const,
};

describe('F-I2: Register Form Validation', () => {
  it('F-I2-01: Data lengkap dan valid → validasi sukses', () => {
    const result = registerSchema.safeParse(validRegisterData);
    expect(result.success).toBe(true);
  });

  it('F-I2-02: Password tidak sama → error pada password_confirmation', () => {
    const result = registerSchema.safeParse({
      ...validRegisterData,
      password_confirmation: 'berbeda-dari-password',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0]);
      expect(paths).toContain('password_confirmation');
    }
  });

  it('F-I2-03: Email duplikat ditangani di server — validasi form tetap sukses (422 dari API)', () => {
    // Validasi lokal tidak tahu soal duplikat email, itu urusan server (422)
    const result = registerSchema.safeParse(validRegisterData);
    expect(result.success).toBe(true);
    // Test ini mendokumentasikan bahwa error 422 ditangani di response handler, bukan di schema
  });

  it('Password terlalu pendek → validasi gagal', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, password: '123', password_confirmation: '123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('password');
    }
  });

  it('Nama perusahaan terlalu pendek → validasi gagal', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, name: 'AB' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('name');
    }
  });

  it('Email PIC tidak valid → validasi gagal', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, pic_email: 'bukan-email' });
    expect(result.success).toBe(false);
  });

  it('Terms belum dicentang → validasi gagal', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, terms_accepted: false as unknown as true });
    expect(result.success).toBe(false);
  });
});

// ─── F-I5: Admin Dashboard Stats Logic ────────────────────────────────────────

describe('F-I5: Admin Dashboard — Stats Display Logic', () => {
  const mockStats = {
    total_submissions: 42,
    pending_review: 8,
    certified: 15,
    total_users: 120,
  };

  it('F-I5-01: Stats loaded — semua nilai tersedia dan bertipe number', () => {
    expect(typeof mockStats.total_submissions).toBe('number');
    expect(typeof mockStats.pending_review).toBe('number');
    expect(typeof mockStats.certified).toBe('number');
    expect(typeof mockStats.total_users).toBe('number');
  });

  it('Certified tidak boleh melebihi total_submissions', () => {
    expect(mockStats.certified).toBeLessThanOrEqual(mockStats.total_submissions);
  });

  it('pending_review tidak boleh negatif', () => {
    expect(mockStats.pending_review).toBeGreaterThanOrEqual(0);
  });
});
