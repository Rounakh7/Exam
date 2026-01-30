import { Exam } from '../types';
import { request } from './client';

export async function getExams(): Promise<Exam[]> {
  const { data, ok } = await request<Exam[]>('/api/exams');
  if (!ok || !Array.isArray(data)) return [];
  return data as Exam[];
}

export async function createExam(exam: Omit<Exam, 'createdAt'> & { createdAt?: string }): Promise<{ success: boolean; exam?: Exam; error?: string }> {
  const payload = {
    ...exam,
    createdAt: exam.createdAt || new Date().toISOString(),
  };
  const { data, ok, error } = await request<Exam>('/api/exams', {
    method: 'POST',
    body: payload,
  });
  if (!ok) return { success: false, error: (data as { error?: string })?.error || error };
  return { success: true, exam: data as Exam };
}

export async function updateExam(exam: Exam): Promise<{ success: boolean; exam?: Exam; error?: string }> {
  const { data, ok, error } = await request<Exam>(`/api/exams/${exam.id}`, {
    method: 'PUT',
    body: exam,
  });
  if (!ok) return { success: false, error: (data as { error?: string })?.error || error };
  return { success: true, exam: data as Exam };
}

export async function deleteExam(id: string): Promise<{ success: boolean; error?: string }> {
  const { ok, error, data } = await request(`/api/exams/${id}`, { method: 'DELETE' });
  if (!ok) return { success: false, error: (data as { error?: string })?.error || error };
  return { success: true };
}
