import { API_BASE_URL } from '@/shared/config/env';
import { ApiError } from './errors';
import { getStoredToken } from './token-storage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  headers: Headers;
}

interface SuccessEnvelope<T> {
  data: T;
  meta: { requestId: string };
}

interface ErrorEnvelope {
  error: { code: string; message: string; fields?: { path: string; message: string }[] };
  meta: { requestId: string };
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as { error: unknown }).error === 'object'
  );
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers, signal, skipAuth = false } = options;
  const requestHeaders: Record<string, string> = { ...headers };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  if (!skipAuth) {
    const token = getStoredToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: 'Не удалось соединиться с сервером. Проверьте подключение и попробуйте снова.',
      status: 0,
    });
  }

  if (response.status === 204) {
    return { data: undefined as T, headers: response.headers };
  }

  const rawText = await response.text();
  let parsed: unknown;

  if (rawText.length > 0) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new ApiError({
        code: 'PARSE_ERROR',
        message: 'Сервер вернул некорректный ответ.',
        status: response.status,
      });
    }
  }

  if (!response.ok) {
    if (isErrorEnvelope(parsed)) {
      throw new ApiError({
        code: parsed.error.code,
        message: parsed.error.message,
        fields: parsed.error.fields,
        status: response.status,
        requestId: parsed.meta?.requestId,
      });
    }
    throw new ApiError({
      code: 'UNKNOWN_ERROR',
      message: 'Не удалось выполнить запрос.',
      status: response.status,
    });
  }

  const envelope = parsed as SuccessEnvelope<T>;
  return { data: envelope.data, headers: response.headers };
}
