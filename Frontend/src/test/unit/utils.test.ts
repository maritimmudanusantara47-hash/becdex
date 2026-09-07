import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatCurrency,
  getStatusColor,
  getScoreCategory,
} from '@/lib/utils';

// ─── F-U1: formatDate ─────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns formatted Indonesian date for valid ISO string', () => {
    const result = formatDate('2026-01-15T00:00:00Z');
    // Format: DD Mon YYYY in id-ID locale
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2026/);
  });

  it('returns "-" for null input', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('returns "-" for undefined input', () => {
    expect(formatDate(undefined)).toBe('-');
  });

  it('returns "-" for empty string', () => {
    expect(formatDate('')).toBe('-');
  });
});

// ─── F-U2: formatCurrency ─────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats zero as Rp 0', () => {
    const result = formatCurrency(0);
    expect(result).toMatch(/0/);
    // Should contain IDR symbol Rp or similar
    expect(result.toLowerCase()).toMatch(/rp|idr/i);
  });

  it('formats 100000 correctly', () => {
    const result = formatCurrency(100000);
    // Should contain 100 and 000 (with separator)
    expect(result).toMatch(/100/);
    expect(result).toMatch(/000/);
  });

  it('formats large number with proper separators', () => {
    const result = formatCurrency(1500000);
    expect(result).toMatch(/1[.,]500[.,]000|1\.500\.000/);
  });

  it('does not include decimal places for whole numbers', () => {
    const result = formatCurrency(100000);
    // minimumFractionDigits: 0, so no .00
    expect(result).not.toMatch(/,00$|\.00$/);
  });
});

// ─── F-U3: getStatusColor ─────────────────────────────────────────────────────

describe('getStatusColor', () => {
  it('returns blue classes for info color', () => {
    const result = getStatusColor('info');
    expect(result).toContain('blue');
  });

  it('returns yellow classes for warning color', () => {
    const result = getStatusColor('warning');
    expect(result).toContain('yellow');
  });

  it('returns green classes for success color', () => {
    const result = getStatusColor('success');
    expect(result).toContain('green');
  });

  it('returns red classes for danger color', () => {
    const result = getStatusColor('danger');
    expect(result).toContain('red');
  });

  it('returns fallback gray classes for unknown color', () => {
    const result = getStatusColor('unknown-color');
    expect(result).toContain('gray');
  });
});

// ─── F-U4: getScoreCategory ───────────────────────────────────────────────────

describe('getScoreCategory', () => {
  it('returns Excellent for score >= 89', () => {
    expect(getScoreCategory(89).label).toBe('Excellent');
    expect(getScoreCategory(100).label).toBe('Excellent');
  });

  it('returns Good for score 79-88', () => {
    expect(getScoreCategory(79).label).toBe('Good');
    expect(getScoreCategory(88).label).toBe('Good');
  });

  it('returns Standard for score 69-78', () => {
    expect(getScoreCategory(69).label).toBe('Standard');
    expect(getScoreCategory(78).label).toBe('Standard');
  });

  it('returns Not Certified for score below 69', () => {
    expect(getScoreCategory(68).label).toBe('Not Certified');
    expect(getScoreCategory(0).label).toBe('Not Certified');
  });

  it('returns correct color class for each category', () => {
    expect(getScoreCategory(95).color).toContain('emerald');
    expect(getScoreCategory(82).color).toContain('blue');
    expect(getScoreCategory(72).color).toContain('yellow');
    expect(getScoreCategory(50).color).toContain('red');
  });
});
