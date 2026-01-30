import { User } from '../types';
import { request, setToken } from './client';

export async function login(username: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const { data, ok, error } = await request<{ user: User; token: string }>('/api/auth/login', {
    method: 'POST',
    body: { username, password },
  });
  if (!ok || !data) {
    return { success: false, error: (data as { error?: string })?.error || error || 'Login failed' };
  }
  setToken((data as { token: string }).token);
  return { success: true, user: (data as { user: User }).user };
}

export async function register(
  username: string,
  password: string,
  role: 'admin' | 'student'
): Promise<{ success: boolean; error?: string; user?: User }> {
  const { data, ok, error } = await request<{ user: User; token: string }>('/api/auth/register', {
    method: 'POST',
    body: { username, password, role },
  });
  if (!ok || !data) {
    return { success: false, error: (data as { error?: string })?.error || error || 'Registration failed' };
  }
  setToken((data as { token: string }).token);
  return { success: true, user: (data as { user: User }).user };
}

export async function fetchMe(): Promise<User | null> {
  const { data, ok } = await request<User>('/api/auth/me');
  if (!ok || !data) return null;
  return data as User;
}

export async function updateMyCourses(courseKey: string): Promise<User | null> {
  const { data, ok } = await request<User>('/api/auth/me/courses', {
    method: 'PUT',
    body: { courseKey },
  });
  if (!ok || !data) return null;
  return data as User;
}
