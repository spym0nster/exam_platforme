import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ESEN Digital Assessment",
  description:
    "Plateforme d'évaluation numérique ESEN — les mêmes examens, sans la barrière de l'écriture manuscrite.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-soft text-ink">{children}</body>
    </html>
  );
}
