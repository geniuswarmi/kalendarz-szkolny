import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Kalendarz Roku Szkolnego – ZS nr 4 Tychy",
  description: "Kalendarz roku szkolnego Zespołu Szkół nr 4 im. Janusza Groszkowskiego w Tychach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-100 text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}