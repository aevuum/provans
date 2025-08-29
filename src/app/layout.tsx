import type { Metadata } from "next";
import "../frontend/app/globals.css";
import Header from "../frontend/app/components/Header";
import { Footer } from "../frontend/app/components/Footer";
import NotificationContainer from "../frontend/app/components/NotificationContainer";
import { Providers } from "../frontend/app/providers";

export const metadata: Metadata = {
  title: "Provance Decor | Эксклюзивный декор для дома и подарков – Ручная работа",
  description:
    "Купить авторский декор для интерьера: фоторамки, вазы, зеркала, текстиль, посуда, ароматы для дома. Натуральные материалы, доставка по всей России.",
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
    "подарки для дома",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased flex flex-col min-h-screen">
        <Providers>
          <Header />
          {children}
          <Footer />
          <NotificationContainer />
        </Providers>
      </body>
    </html>
  );
}
