const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export function formatPrice(kopecks: number): string {
  return currencyFormatter.format(kopecks / 100);
}
