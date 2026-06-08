import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Public_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/query-provider";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const publicSans = Public_Sans({
  variable: "--font-public",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-data",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "GestEq — Gestão de Equipamentos de Terceiros",
  description: "Gestão, homologação e rastreabilidade de equipamentos de terceiros (Norma 445.000)",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GestEq",
  },
};

export const viewport: Viewport = {
  themeColor: "#00995D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${spaceGrotesk.variable} ${publicSans.variable} ${ibmPlexMono.variable} antialiased`}>
        <Providers>
          <RegisterServiceWorker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
