import { Cormorant_Infant, Jost } from 'next/font/google';

export const fontScript = Cormorant_Infant({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-script',
});

export const fontSans = Jost({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-sans',
});
