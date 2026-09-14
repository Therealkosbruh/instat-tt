export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4001').replace(
  /\/$/,
  '',
);
const BASE_URL = API_BASE_URL;

export type ApiErrorKind = 'network' | 'http' | 'parse';

export interface ApiErrorInfo {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  code?: string;
  requestId?: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly requestId?: string;

  constructor(info: ApiErrorInfo) {
    super(info.message);
    this.name = 'ApiError';
    this.kind = info.kind;
    this.status = info.status;
    this.code = info.code;
    this.requestId = info.requestId;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  if (error instanceof Error) return new ApiError({ kind: 'network', message: error.message });
  return new ApiError({ kind: 'network', message: 'Неизвестная ошибка запроса.' });
}

export type HttpMethod = 'GET' | 'POST' | 'PUT';

export interface RequestOptions {
  method?: HttpMethod;
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

function isErrorEnvelope(value: unknown): value is { error: { code: string; message: string } } {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const error = (value as { error: unknown }).error;
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}

async function toHttpError(response: Response): Promise<ApiError> {
  const requestId = response.headers.get('X-Request-Id') ?? undefined;
  const fallback = new ApiError({
    kind: 'http',
    status: response.status,
    message: `Сервер ответил ошибкой ${response.status}.`,
    requestId,
  });
  const text = await response.text().catch(() => '');
  if (!text) return fallback;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return fallback;
  }
  if (!isErrorEnvelope(parsed)) return fallback;
  return new ApiError({
    kind: 'http',
    status: response.status,
    code: parsed.error.code,
    message: parsed.error.message,
    requestId,
  });
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 304) return undefined as T;
  if (response.headers.get('Content-Length') === '0') return undefined as T;
  let text: string;
  try {
    text = await response.text();
  } catch {
    throw new ApiError({ kind: 'parse', message: 'Не удалось прочитать ответ сервера.' });
  }
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError({ kind: 'parse', message: 'Сервер вернул некорректный JSON.' });
  }
}

export async function request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  const { method = 'GET', path, headers, body, signal } = options;
  const init: RequestInit = {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, init);
  } catch (cause) {
    if (isAbortError(cause)) throw cause;
    throw new ApiError({
      kind: 'network',
      message: 'Не удалось связаться с сервером. Проверьте подключение.',
    });
  }

  if (!response.ok) throw await toHttpError(response);

  const data = await parseBody<T>(response);
  return { data, status: response.status, headers: response.headers };
}
