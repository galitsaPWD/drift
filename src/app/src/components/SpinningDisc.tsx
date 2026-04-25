"use client";

import { motion } from "framer-motion";
import { Pairing } from "@/lib/data";

interface Props {
  pairing: Pairing;
  isPlaying: boolean;
}

export function SpinningDisc({ pairing, isPlaying }: Props) {
  return (
    <div className="absolute bottom-10 right-10 z-40 flex flex-col items-center gap-3">
      {/* Vinyl disc */}
      <motion.div
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="relative rounded-full"
        style={{
          width: 72,
          height: 72,
          background: "radial-gradient(circle at 50%, #222 0%, #111 40%, #1a1a1a 60%, #0d0d0d 100%)",
          boxShadow: isPlaying
            ? "0 0 24px rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.6)"
            : "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        {/* Vinyl groove rings */}
        {[18, 24, 30].map((r) => (
          <div
            key={r}
            className="absolute rounded-full border border-white/[0.04]"
            style={{
              inset: r,
            }}
          />
        ))}

        {/* Album art label */}
        <div
          className="absolute rounded-full overflow-hidden border border-white/10"
          style={{ inset: 18 }}
        >
          {pairing.image_url ? (
            <img
              src={pairing.image_url}
              alt={pairing.vibe}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/10" />
          )}
        </div>

        {/* Center spindle */}
        <div
          className="absolute bg-white/30 rounded-full"
          style={{ inset: "calc(50% - 3px)", width: 6, height: 6 }}
        />
      </motion.div>

      {/* Track info under disc */}
      <div className="text-center pointer-events-none">
        <div className="font-dm-sans text-[7px] uppercase tracking-[.3em] text-text/70 leading-none truncate max-w-[80px]">
          {pairing.song_title}
        </div>
      </div>
    </div>
  );
}
