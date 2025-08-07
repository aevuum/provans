//app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/responsive.css";
import  {Header}  from "./components/Header";
import { Footer } from "./components/Footer";
import { Providers } from './providers';
import NotificationContainer from './components/NotificationContainer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Provans Decor | Эксклюзивный декор для дома и подарков – Ручная работа",
  description: "Купить авторский декор для интерьера: фоторамки, вазы, зеркала, текстиль, посуда, ароматы для дома. Натуральные материалы, доставка по всей России.",
  keywords: [
    "купить декор для дома",
    "интерьерный декор",
    "ручная работа",
    "экологичные материалы",
    "фоторамки",
    "вазы",
    "зеркала",
    "подсвечники",
    "шкатулки",
    "интерьерные фигуры",
    "часы",
    "садовый декор",
    "искусственные цветы",
    "текстиль для дома",
    "посуда",
    "бокалы",
    "мебель",
    "ароматы для дома",
    "свечи",
    "Пасхальный декор",
    "Новогодний декор",
    "елочные игрушки",
    "подарки для дома"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <NotificationContainer />
        </Providers>
      </body>
    </html>
  );
}