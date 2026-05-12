import type { Answers } from '../types';

/**
 * Small pure helpers used by the policy section builders. Kept separate
 * so they're trivially unit-testable.
 */

export function strAnswer(a: Answers, key: string): string {
  const v = a[key];
  return typeof v === 'string' ? v : '';
}

export function arrAnswer(a: Answers, key: string): string[] {
  const v = a[key];
  return Array.isArray(v) ? v : [];
}

export function has(arr: string[] | undefined, value: string): boolean {
  return Array.isArray(arr) && arr.includes(value);
}

export function any(arr: string[] | undefined, values: string[]): boolean {
  return Array.isArray(arr) && values.some((v) => arr.includes(v));
}

export function ownerName(owner: string | undefined): string {
  return (
    {
      cto: 'Chief Technology Officer',
      ciso: 'Chief Information Security Officer',
      legal: 'Head of Legal & Compliance',
      committee: 'AI Governance Committee',
      undefined: '[AI Governance Owner — to be assigned]',
    } as Record<string, string>
  )[owner ?? ''] ?? '[AI Governance Owner — to be assigned]';
}

export function countriesPhrase(arr: string[] | undefined): string {
  if (!arr || !arr.length) return '';
  const map: Record<string, string> = {
    au: 'Australia',
    nz: 'New Zealand',
    ph: 'the Philippines',
    us: 'the United States',
    'ca-state': 'California',
    uk: 'the United Kingdom',
    eu: 'the European Union',
    ca: 'Canada',
    sg: 'Singapore',
    in: 'India',
    other: 'other operating regions',
  };
  const named = arr.map((c) => map[c]).filter(Boolean);
  if (named.length === 1) return named[0];
  if (named.length === 2) return named.join(' and ');
  return named.slice(0, -1).join(', ') + ', and ' + named[named.length - 1];
}

export function sensitiveList(arr: string[] | undefined): string {
  if (!arr || !arr.length || arr.includes('none')) {
    return 'personal information, financial records, and proprietary business data';
  }
  const map: Record<string, string> = {
    pii: 'personal information (PII)',
    phi: 'protected health information (PHI)',
    payment: 'payment-card data',
    financial: 'financial records',
    ip: 'source code and intellectual property',
    classified: 'classified or government-controlled information',
  };
  return arr
    .map((s) => map[s])
    .filter(Boolean)
    .join(', ');
}
