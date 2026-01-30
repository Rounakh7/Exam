import { ExamAttempt } from '../types';
import { request } from './client';

export async function getAttempts(): Promise<ExamAttempt[]> {
  const { data, ok } = await request<ExamAttempt[]>('/api/attempts');
  if (!ok || !Array.isArray(data)) return [];
  return data as ExamAttempt[];
}

export async function createAttempt(attempt: ExamAttempt): Promise<{ success: boolean; error?: string }> {
  const { ok, error, data } = await request('/api/attempts', {
    method: 'POST',
    body: attempt,
  });
  if (!ok) return { success: false, error: (data as { error?: string })?.error || error };
  return { success: true };
}
