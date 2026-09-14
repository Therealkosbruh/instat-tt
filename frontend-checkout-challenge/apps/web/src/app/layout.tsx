import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { fontSans, fontScript } from '@/shared/config/fonts';
import { Footer } from '@/widgets/footer/Footer';
import { Header } from '@/widgets/header/Header';
import { Providers } from './providers';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Магазин',
  description: 'Каталог, корзина и оформление заказа',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="ru" className={`${fontScript.variable} ${fontSans.variable}`}>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
