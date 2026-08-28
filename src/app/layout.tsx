import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "500", "600"],
});

export const metadata: Metadata = {
  title: "LSA Bookings — Raffles American School",
  description: "Book tennis sessions with Lowry Sports Academy at Raffles American School.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--lsa-bg)] text-[var(--lsa-black)] font-sans">
        {children}
      </body>
    </html>
  );
}
