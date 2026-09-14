interface ApiFieldError {
  path: string;
  message: string;
}

export function mapFieldErrors(
  fields: ApiFieldError[] | undefined,
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fields) return result;

  for (const field of fields) {
    result[field.path] = field.message;
  }

  return result;
}

export function apiPathToFieldName(path: string): string {
  return path.replace(/^body\//, '').replace(/\//g, '.');
}
