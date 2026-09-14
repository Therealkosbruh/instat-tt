import { apiRequest } from '@/shared/api/client';
import { getStoredToken, setStoredToken } from '@/shared/api/token-storage';

interface SessionData {
  id: string;
  token: string;
}

export async function ensureSession(): Promise<string> {
  const existing = getStoredToken();
  if (existing) return existing;

  const { data } = await apiRequest<SessionData>('/api/sessions', {
    method: 'POST',
    body: {},
    skipAuth: true,
  });
  setStoredToken(data.token);
  return data.token;
}
