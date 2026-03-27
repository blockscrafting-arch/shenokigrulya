import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import localFont from "next/font/local";
import { CartProvider } from "@/hooks/useCart";
import { FigmaCaptureScript } from "@/components/FigmaCaptureScript";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

const bebasNeue = localFont({
  src: "../fonts/BebasNeue-Bold.otf",
  weight: "700",
  style: "normal",
  variable: "--font-heading",
  display: "swap",
});

/** Nunito — ближайший свободный аналог фирменного шрифта Ozon (округлый, жирный) */
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-ozon",
  weight: ["900"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://puppyigrulya.ru";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Щенок Игруля — Корм для собак",
    template: "%s | Щенок Игруля",
  },
  description:
    "Полнорационный корм класса холистик для взрослых собак крупных и средних пород. Гипоаллергенный, без глютена.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: baseUrl,
    siteName: "Щенок Игруля",
    title: "Щенок Игруля — Корм для собак",
    description:
      "Полнорационный корм класса холистик для взрослых собак крупных и средних пород.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** Без этого на мобильных страница может масштабироваться как «десктоп» — кажется, что всё огромное */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="ru" className={`${inter.variable} ${bebasNeue.variable} ${nunito.variable}`}>
      <body className="min-h-screen antialiased font-body bg-white text-ink">
        {process.env.NODE_ENV === "development" && <FigmaCaptureScript />}
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
