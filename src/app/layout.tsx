import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Header from "./components/Header";
import { Footer } from "./components/Footer";
import NotificationContainer from "./components/NotificationContainer";

export const metadata: Metadata = {
  title: "Provans Decor | Эксклюзивный декор для дома и подарков – Ручная работа",
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
        {/* Провайдеры приложения (NextAuth + Redux) */}
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