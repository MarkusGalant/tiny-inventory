import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup, configure } from '@testing-library/react';
import { expect, afterEach, vi, beforeAll } from 'vitest';

// Configure React Testing Library to automatically flush updates
// This helps prevent act() warnings from Material-UI and other libraries
configure({
  asyncUtilTimeout: 5000,
  // Automatically flush updates to prevent act warnings
  // This is especially helpful with Material-UI components
  testIdAttribute: 'data-testid',
});

// Suppress act warnings that are false positives
// These often occur with Material-UI components and react-hook-form
// which trigger state updates during render/effects
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Check if this is an act() warning
    const message = args[0];
    if (
      (typeof message === 'string' &&
        (message.includes('Warning: An update to') ||
          message.includes('was not wrapped in act') ||
          message.includes('wrap tests with act'))) ||
      (typeof message === 'object' &&
        message !== null &&
        'message' in message &&
        typeof message.message === 'string' &&
        (message.message.includes('Warning: An update to') ||
          message.message.includes('was not wrapped in act') ||
          message.message.includes('wrap tests with act')))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Import translations for mocking
import enTranslations from '@/config/locales/en.json';

// Helper function to get nested translation value
function getTranslation(key: string): string {
  const keys = key.split('.');
  let value: any = enTranslations;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key; // Fallback to key if not found
  }
  return typeof value === 'string' ? value : key;
}

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => getTranslation(key),
    i18n: {},
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  // Mock other components if necessary, like Trans
}));

// Mock our custom useTranslation hook
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => getTranslation(key),
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
    currentLanguage: 'en',
    changeLanguage: vi.fn(),
  }),
}));

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
