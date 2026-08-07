import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, daysBetween, generateReference, generateReferralCode } from '@/lib/constants';

describe('formatCurrency', () => {
  it('formats positive amounts with R prefix', () => {
    expect(formatCurrency(100)).toMatch(/^R/);
    expect(formatCurrency(100)).toContain('100');
  });
  it('formats zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });
  it('formats large numbers', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1');
    expect(result).toContain('000');
    expect(result).toContain('00');
  });
});

describe('formatDate', () => {
  it('formats ISO date strings', () => {
    const result = formatDate('2024-01-15T10:00:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });
});

describe('daysBetween', () => {
  it('calculates days between two dates', () => {
    expect(daysBetween('2024-01-01', '2024-01-31')).toBe(30);
    expect(daysBetween('2024-01-01', '2024-01-02')).toBe(1);
  });
  it('returns 0 for same date', () => {
    expect(daysBetween('2024-01-01', '2024-01-01')).toBe(0);
  });
});

describe('generateReference', () => {
  it('generates unique references with prefix', () => {
    const ref1 = generateReference('DEP');
    const ref2 = generateReference('DEP');
    expect(ref1).toMatch(/^DEP-/);
    expect(ref2).toMatch(/^DEP-/);
    expect(ref1).not.toBe(ref2);
  });
});

describe('generateReferralCode', () => {
  it('generates 6-character uppercase codes', () => {
    const code = generateReferralCode();
    expect(code).toHaveLength(6);
    expect(code).toBe(code.toUpperCase());
  });
  it('generates unique codes', () => {
    const code1 = generateReferralCode();
    const code2 = generateReferralCode();
    expect(code1).not.toBe(code2);
  });
});
