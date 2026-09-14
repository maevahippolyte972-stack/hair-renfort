import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hair'Renfort",
  description:
    "La mise en relation entre salons de coiffure et coiffeurs freelances, pour du renfort ponctuel et non-exclusif.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${inter.variable} font-sans`}>
        <div className="grain" aria-hidden />
        <div className="relative z-[1]">{children}</div>
      </body>
    </html>
  );
}
