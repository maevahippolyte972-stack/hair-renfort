import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Hair'Renfort",
  description:
    "La mise en relation entre salons de coiffure et coiffeurs freelances, pour du renfort ponctuel et non-exclusif.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${playfairDisplay.variable} ${plusJakartaSans.variable} font-sans`}>
        <div className="grain" aria-hidden />
        <div className="relative z-[1]">{children}</div>
      </body>
    </html>
  );
}
