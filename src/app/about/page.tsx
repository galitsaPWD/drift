"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-8 md:p-24 overflow-hidden relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] left-[20%] w-[50%] h-[50%] bg-white/[0.03] rounded-full blur-[140px]" />
      </div>

      <div className="max-w-[700px] relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.2, ease: "easeOut" }}
           className="space-y-12"
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 font-dm-sans text-[10px] uppercase tracking-[.4em] text-muted hover:text-text transition-colors group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            back to drift
          </Link>

          <p className="font-cormorant italic text-[clamp(28px,5vw,48px)] leading-[1.3] text-text text-shadow-editorial">
            DRIFT is a place where outfits and songs are the same thing. you navigate a space instead of scrolling a feed — louder fits up top, quieter ones below, harder music to the right, softer to the left. every pairing was chosen because it felt like something. no likes. no follows. just the feeling.
          </p>

          <div className="pt-8 border-t border-white/10">
            <p className="font-dm-sans text-[10px] uppercase tracking-[.6em] text-muted2">
              taste made tangible / v1.0
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
