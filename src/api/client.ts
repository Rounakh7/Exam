const TOKEN_KEY = 'exam_token';

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3001`;
  }
  return '';
};

const baseUrl = getBaseUrl();

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function request<T = unknown>(
  path: string,
  options: RequestInit & { body?: object } = {}
): Promise<{ data?: T; error?: string; ok: boolean; status: number }> {
  const { body, ...rest } = options;
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((rest.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : rest.body,
  });
  let data: T | { error?: string } | null = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = null;
    }
  }
  const error = (data && typeof data === 'object' && 'error' in data && data.error) || (res.ok ? undefined : res.statusText || 'Request failed');
  return { data: data as T, error, ok: res.ok, status: res.status };
}
