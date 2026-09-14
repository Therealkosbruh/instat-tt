import { isApiError } from '@/shared/api/errors';

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return 'Неизвестная ошибка. Попробуйте ещё раз.';
}
