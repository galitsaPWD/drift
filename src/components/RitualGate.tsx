"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Props {
  onEnter: () => void;
  backgroundVibe?: string;
}

export function RitualGate({ onEnter, backgroundVibe }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isSequenced = sessionStorage.getItem("drift_sequenced");
    if (isSequenced === "true") {
      setIsVisible(false);
      onEnter();
    }
    setMounted(true);
  }, [onEnter]);

  const handleEnter = () => {
    sessionStorage.setItem("drift_sequenced", "true");
    setIsVisible(false);
    setTimeout(onEnter, 1000);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Subtle background glow based on current pairing */}
          <motion.div 
            animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.15, 0.1] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-10"
          />

          <div className="relative z-10 flex flex-col items-center gap-12">
            <div className="flex flex-col items-center gap-4">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="font-dm-sans text-[8px] uppercase tracking-[.8em] text-white"
              >
                established 2026
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.2, duration: 1.5 }}
                className="font-cormorant italic text-6xl md:text-8xl text-white tracking-tight"
              >
                Ready to Drift?
              </motion.h1>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              onClick={handleEnter}
              className="group relative px-12 py-5 overflow-hidden"
            >
              <div className="absolute inset-0 border border-white/20 group-hover:border-white transition-colors duration-500 rounded-full" />
              <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left opacity-[0.03]" />
              
              <span className="relative z-10 font-dm-sans text-[10px] uppercase tracking-[.5em] text-white/80 group-hover:text-white transition-colors duration-500">
                Begin Sequence
              </span>
            </motion.button>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 2, duration: 2 }}
            className="absolute bottom-12 font-dm-sans text-[7px] uppercase tracking-[.4em] text-muted text-center max-w-[200px] leading-loose"
          >
            Audio experience recommended <br /> immersive environment enabled
          </motion.div>
          
          {/* Film Grain Texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay grain-texture" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
