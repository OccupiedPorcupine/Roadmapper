import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Roadmap Builder",
  description: "What do you want to learn today?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={`min-h-screen bg-[#000000] font-sans text-white ${inter.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
