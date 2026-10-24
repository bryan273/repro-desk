import { createClient } from '@metagptx/web-sdk';

export const client = createClient();

export type PlanId = 'student' | 'lab' | 'team';

export interface FunnelStats {
  visits: number;
  form_starts: number;
  submissions: number;
  conversion_rate: number;
  form_start_rate: number;
}
export type RequestStatus = 'new' | 'in_review' | 'done' | 'declined';

/** Mirrors the backend repro_requests contract. */
export interface ReproRequest {
  id: number;
  paper_link: string;
  claim: string;
  email: string;
  language?: string | null;
  plan?: PlanId | null;
  status?: RequestStatus | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ReproRequestInput {
  paper_link: string;
  claim: string;
  email: string;
  language: 'en' | 'zh';
  plan: PlanId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorMessage(e: any, fallback: string): string {
  const detail = e?.data?.detail ?? e?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg).filter(Boolean).join('; ') || fallback;
  if (typeof detail === 'string') return detail;
  return e?.message || fallback;
}
