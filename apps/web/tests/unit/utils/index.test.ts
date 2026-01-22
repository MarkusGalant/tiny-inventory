import { describe, it, expect } from 'vitest';

import { formatCurrency, formatNumber } from '@/utils';

describe('formatCurrency', () => {
  it('should format positive numbers as currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format large numbers with thousands separators', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    expect(formatCurrency(999999.99)).toBe('$999,999.99');
  });

  it('should format numbers with exactly 2 decimal places', () => {
    expect(formatCurrency(10.5)).toBe('$10.50');
    expect(formatCurrency(10.99)).toBe('$10.99');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(0.0)).toBe('$0.00');
  });

  it('should format small decimal values correctly', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
    expect(formatCurrency(0.1)).toBe('$0.10');
  });
});

describe('formatNumber', () => {
  it('should format positive integers', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(0)).toBe('0');
  });

  it('should format large numbers with thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(999999)).toBe('999,999');
  });

  it('should format decimal numbers', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber(100.5)).toBe('100.5');
  });

  it('should format zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(0.0)).toBe('0');
  });

  it('should format negative numbers', () => {
    expect(formatNumber(-1234)).toBe('-1,234');
    expect(formatNumber(-100.5)).toBe('-100.5');
  });
});
