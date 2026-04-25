import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "@/app/globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300"],
  style: ["italic"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["200"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "DRIFT — Taste Made Tangible",
  description: "A fashion and music pairing experience.",
};

import { Header } from "@/components/Header";
import { ClientOnly } from "@/components/ClientOnly";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-[#050505]">
        
        {/* Desktop Ambient Letterbox Margins (Dynamic) */}
        <div suppressHydrationWarning className="hidden md:block fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000">
          {/* Top Left Orb */}
          <div 
            suppressHydrationWarning
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[180px] opacity-[0.08] transition-colors duration-1000" 
            style={{ backgroundColor: 'var(--vibe-color)' }}
          />
          {/* Bottom Right Orb */}
          <div 
            suppressHydrationWarning
            className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[200px] opacity-[0.05] transition-colors duration-1000" 
            style={{ backgroundColor: 'var(--vibe-color)' }}
          />
          {/* Center Subtle Glow */}
          <div suppressHydrationWarning className="absolute inset-0 bg-[#020202]/60" />
        </div>

        {/* Main Content Viewport */}
        <div suppressHydrationWarning className="relative mx-auto w-full min-h-screen bg-black z-10">
          <ClientOnly>
            <Header />
            <div className="grain-overlay" aria-hidden="true" />
            {children}
          </ClientOnly>
        </div>
      </body>
    </html>
  );
}
