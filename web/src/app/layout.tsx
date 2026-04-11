import type { ReactNode } from "react";
import { Montserrat, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html
      lang="fr"
      dir="ltr"
      suppressHydrationWarning
      className={`${montserrat.variable} ${notoArabic.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-bcp-page text-bcp-anthracite antialiased">
        {children}
      </body>
    </html>
  );
}
