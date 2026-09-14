export interface SummaryItem {
  id: string;
  title: string;
  quantity: number;
  lineTotal: number;
}

export interface SummaryLine {
  label: string;
  value: number | string;
}
