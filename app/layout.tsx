import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600"], // 300 isn't available for Garamond typically in Google Fonts, we'll use 400 as base
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pemanfaatan AI Secara Etis | Bahan Ajar Digital",
  description: "Modul interaktif tentang cara kerja AI, risiko, dan bagaimana menggunakannya secara bertanggung jawab.",
};

import HoverSoundWrapper from './components/HoverSoundWrapper';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${ebGaramond.variable} ${inter.variable}`}>
      <body>
        <HoverSoundWrapper>{children}</HoverSoundWrapper>
      </body>
    </html>
  );
}
