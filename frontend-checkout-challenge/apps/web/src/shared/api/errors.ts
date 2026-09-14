export interface ApiFieldError {
  path: string;
  message: string;
}

interface ApiErrorParams {
  code: string;
  message: string;
  status: number;
  fields?: ApiFieldError[];
  requestId?: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields?: ApiFieldError[];
  readonly requestId?: string;

  constructor({ code, message, status, fields, requestId }: ApiErrorParams) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
    this.requestId = requestId;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const RECOVERABLE_CODES = new Set(['CART_VERSION_CONFLICT', 'QUOTE_EXPIRED']);
export function isStaleDataError(error: unknown): boolean {
  return isApiError(error) && RECOVERABLE_CODES.has(error.code);
}
