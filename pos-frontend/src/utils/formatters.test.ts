import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber, formatPercentage } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency with default NGN', () => {
      expect(formatCurrency(1000)).toContain('₦');
      expect(formatCurrency(1000)).toContain('1,000');
    });

    it('should format currency with custom currency', () => {
      const result = formatCurrency(1000, 'USD');
      expect(result).toContain('$');
      expect(result).toContain('1,000');
    });

    it('should format decimal amounts', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1,234.56');
    });

    it('should format zero amount', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('should format negative amounts', () => {
      const result = formatCurrency(-100);
      expect(result).toContain('-');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T10:30:00Z');

    it('should format date in short format', () => {
      const result = formatDate(testDate, 'short');
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2}/);
    });

    it('should format date in medium format', () => {
      const result = formatDate(testDate, 'medium');
      expect(result).toContain('Jan');
      expect(result).toContain('2024');
    });

    it('should format date in long format', () => {
      const result = formatDate(testDate, 'long');
      expect(result).toContain('2024');
    });

    it('should format date in time format', () => {
      const result = formatDate(testDate, 'time');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format date in datetime format', () => {
      const result = formatDate(testDate, 'datetime');
      expect(result).toContain('Jan');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should handle string dates', () => {
      const result = formatDate('2024-01-15T10:30:00Z', 'medium');
      expect(result).toContain('Jan');
    });

    it('should default to medium format', () => {
      const result = formatDate(testDate);
      expect(result).toContain('Jan');
    });
  });

  describe('formatNumber', () => {
    it('should format whole numbers', () => {
      expect(formatNumber(1000)).toBe('1,000');
    });

    it('should format numbers with decimals', () => {
      expect(formatNumber(1234.56, 2)).toBe('1,234.56');
    });

    it('should format zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should format negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
    });

    it('should respect decimal places', () => {
      expect(formatNumber(1234.567, 1)).toBe('1,234.6');
      expect(formatNumber(1234.567, 3)).toBe('1,234.567');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      expect(formatPercentage(25.5)).toBe('25.5%');
    });

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(25.567, 2)).toBe('25.57%');
    });

    it('should format zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should format negative percentage', () => {
      expect(formatPercentage(-10)).toBe('-10.0%');
    });
  });
});

