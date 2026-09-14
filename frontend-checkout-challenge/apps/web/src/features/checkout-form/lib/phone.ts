export function normalizePhoneDigits(rawInput: string): string {
  let digits = rawInput.replace(/\D/g, '');
  if (digits.length === 0) return '';

  if (digits[0] === '8') {
    digits = '7' + digits.slice(1);
  } else if (digits[0] !== '7') {
    digits = '7' + digits;
  }

  return digits.slice(0, 11);
}

export function toE164(rawInput: string): string {
  const digits = normalizePhoneDigits(rawInput);
  return digits ? `+${digits}` : '';
}

export function formatPhoneForDisplay(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';

  const country = digits.slice(0, 1);
  const area = digits.slice(1, 4);
  const first = digits.slice(4, 7);
  const second = digits.slice(7, 9);
  const third = digits.slice(9, 11);

  let result = `+${country}`;
  if (area) result += ` (${area}${area.length === 3 ? ')' : ''}`;
  if (first) result += ` ${first}`;
  if (second) result += `-${second}`;
  if (third) result += `-${third}`;
  return result;
}
