const TITLE_MAX_LENGTH = 80;

export function validateSpaceTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) return 'Введите название пространства.';
  if (trimmed.length > TITLE_MAX_LENGTH) return `Название длиннее ${TITLE_MAX_LENGTH} символов.`;
  return null;
}
