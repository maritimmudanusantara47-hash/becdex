import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

// ─── F-U2-02: cn() Utility Function ───────────────────────────────────────────
//
// cn() = twMerge(clsx(inputs))
// Memastikan class merge bekerja dengan benar: konflik kelas terakhir yang menang.

describe('F-U2-02: cn() utility', () => {
  it('menggabungkan dua kelas biasa menjadi satu string', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('kelas konfllik — yang terakhir menang (twMerge behavior)', () => {
    // px-2 dan px-4 konflik, px-4 (terakhir) yang menang
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('menghapus kelas falsy (false, null, undefined)', () => {
    expect(cn('block', false, null, undefined)).toBe('block');
  });

  it('mendukung object syntax clsx', () => {
    expect(cn({ hidden: true, block: false })).toBe('hidden');
    expect(cn({ hidden: false, block: true })).toBe('block');
  });

  it('mendukung array syntax clsx', () => {
    expect(cn(['flex', 'items-center'])).toBe('flex items-center');
  });

  it('kelas bg konflik — yang terakhir menang', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('kelas text-size konflik — yang terakhir menang', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('kelas yang tidak konflik tetap keduanya ada', () => {
    const result = cn('font-bold', 'text-center');
    expect(result).toContain('font-bold');
    expect(result).toContain('text-center');
  });

  it('string kosong tidak menghasilkan spasi berlebih', () => {
    const result = cn('flex', '', 'gap-4');
    expect(result).not.toContain('  '); // tidak ada double space
    expect(result).toBe('flex gap-4');
  });

  it('input kosong menghasilkan string kosong', () => {
    expect(cn()).toBe('');
  });
});
