export const APP_NAME = 'Icetropez.Vest';
export const APP_TAGLINE = 'Smart investing, steady growth.';
export const CURRENCY = 'R';
export const CURRENCY_CODE = 'ZAR';

export function formatCurrency(amount: number): string {
  return `${CURRENCY}${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysBetween(start: string | Date, end: string | Date): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function generateReference(prefix = 'DEP'): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export function generateReferralCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
