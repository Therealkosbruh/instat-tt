import { apiPathToFieldName, mapFieldErrors } from '@/shared/lib/map-field-errors';
import type { ApiFieldError } from '@/shared/api/errors';

type CustomerField = 'name' | 'email' | 'phone';

const PATH_TO_FIELD: Record<string, CustomerField> = {
  'customer.name': 'name',
  'customer.email': 'email',
  'customer.phone': 'phone',
};

export function extractCustomerErrors(
  fields: ApiFieldError[] | undefined,
): Partial<Record<CustomerField, string>> {
  const byPath = mapFieldErrors(fields);
  const result: Partial<Record<CustomerField, string>> = {};

  for (const path of Object.keys(byPath)) {
    const field = PATH_TO_FIELD[apiPathToFieldName(path)];
    if (field) result[field] = byPath[path];
  }

  return result;
}
