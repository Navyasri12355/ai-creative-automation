import type { Metadata } from "next";
import { Sora, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IndiSocial — AI Creatives for Indian Brands",
  description:
    "Generate culturally resonant social media content for every Indian festival and occasion, instantly.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${devanagari.variable}`}>
      <body className="font-sora antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}