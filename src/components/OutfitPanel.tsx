"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Pairing } from "@/lib/data";

interface Props {
  pairing: Pairing;
  isPlaying?: boolean;
  discArt?: string | null;
  currentIndex?: number;
  activePicIndex?: number;
  onImageChange?: (index: number) => void;
}

function WaveformBars() {
  const bars = [
    { heights: [3, 12, 4], delay: 0 },
    { heights: [8, 3, 14], delay: 0.15 },
    { heights: [12, 6, 3], delay: 0.3 },
  ];
  return (
    <div className="flex items-end gap-[2px] h-3 mb-[1px]">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          animate={{ height: bar.heights }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "mirror",
            delay: bar.delay,
            ease: "easeInOut",
          }}
          className="w-[2px] bg-text/60 rounded-full"
          style={{ minHeight: 3 }}
        />
      ))}
    </div>
  );
}

export function OutfitPanel({ pairing, isPlaying = false, discArt, currentIndex, activePicIndex = 0, onImageChange }: Props) {
  const DISC_SIZE = 160;
  const [outfitColor, setOutfitColor] = useState<string>("#ffffff");

  // Notify parent of image changes is now redundant if we purely control it,
  // but we keep the logic here for the handle flipping.

  // Sanitize images array to prevent "missing src" crashes
  const rawImages = [pairing.image_url, ...(pairing.additional_images || [])];
  const images = rawImages.filter(url => url && url.trim() !== "");

  const displayIndex = currentIndex !== undefined 
    ? (currentIndex + 1).toString().padStart(2, '0')
    : pairing.ghost_index || '00';

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.currentTarget;
    // Guard: Only run if we have a valid, loaded image with non-zero dimensions
    if (!imgElement || imgElement.naturalWidth === 0 || !imgElement.src || imgElement.src.includes(window.location.origin + '/')) return;

    import("fast-average-color").then(({ FastAverageColor }) => {
      try {
        const fac = new FastAverageColor();
        // Use a lighter color so it stands out against dark backgrounds
        const colorData = fac.getColor(imgElement, { algorithm: 'dominant' });
        setOutfitColor(colorData.hex);
        
        // Inject color into global CSS for ambient margins
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--vibe-color', colorData.hex);
        }
        
        fac.destroy();
      } catch (err) {
        console.warn("Could not extract color from outfit photo");
      }
    }).catch(console.error);
  };

  // PRE-LOAD Lookbook Images for instant flipping
  useEffect(() => {
    if (pairing.additional_images) {
        pairing.additional_images.forEach(url => {
            const img = new (window as any).Image();
            img.src = url;
        });
    }
  }, [pairing.additional_images]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={pairing.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Images Carousel — uses cross-dissolve for premium feel */}
          <div className="absolute inset-0 z-0">
             <AnimatePresence>
                {images[activePicIndex] && (
                  <motion.div
                    key={`${pairing.id}-${activePicIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[activePicIndex]}
                      alt={`${pairing.vibe} - photo ${activePicIndex + 1}`}
                      fill
                      priority
                      unoptimized={true}
                      crossOrigin="anonymous"
                      onLoad={handleImageLoad}
                      className="object-cover"
                      sizes="100vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </motion.div>
                )}
             </AnimatePresence>
            <div className="absolute inset-0 bottom-gradient" />
            
            {/* Bottom-Right Liquid Progress Rail (Above Minimap) */}
            {images.length > 1 && (
              <div className="absolute bottom-32 right-8 flex gap-3 z-30 pointer-events-none">
                {images.map((_, i) => (
                  <motion.div 
                    key={i} 
                    initial={false}
                    animate={{ 
                      width: i === activePicIndex ? 30 : 15,
                      opacity: i === activePicIndex ? 1 : 0.3,
                    }}
                    className={`h-[3px] rounded-full bg-white transition-all duration-500 ${i === activePicIndex ? 'shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}`} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Ghost Index Tracker */}
          <div className="absolute top-12 right-12 select-none pointer-events-none z-10 transition-colors duration-1000">
            <span 
              className="font-cormorant text-[80px] italic leading-none opacity-40 drop-shadow-md transition-colors duration-1000"
              style={{ color: outfitColor }}
            >
              {displayIndex}
            </span>
          </div>

          {/* ── Spinning disc — behind caption and song name (z-10) ── */}
          {/* Half hidden on left: disc is 160px wide, left: -60px → shows right ~100px */}
          <motion.div
            className="absolute z-10 rounded-full pointer-events-none"
            style={{
              width: DISC_SIZE,
              height: DISC_SIZE,
              bottom: 80,
              left: -60,
              background:
                "radial-gradient(circle at 50%, #1c1c1c 0%, #111 45%, #161616 70%, #0a0a0a 100%)",
              boxShadow: isPlaying
                ? "0 0 40px rgba(255,255,255,0.07), inset 0 0 20px rgba(0,0,0,0.8)"
                : "inset 0 0 20px rgba(0,0,0,0.8)",
            }}
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatType: "loop" }}
          >
            {/* Vinyl groove rings */}
            {[22, 32, 42].map((inset) => (
              <div
                key={inset}
                className="absolute rounded-full border border-white/[0.05]"
                style={{ inset }}
              />
            ))}

            {/* Album art label — uses MUSIC thumbnail (discArt) or blurred outfit fallback */}
            <div
              className="absolute rounded-full overflow-hidden border border-white/10"
              style={{ inset: 46 }}
            >
              {discArt ? (
                <img
                  src={discArt}
                  alt="album art"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={images[activePicIndex]} 
                  alt="vibe fallback" 
                  className="w-full h-full object-cover blur-[8px] scale-125 opacity-60"
                />
              )}
            </div>

            {/* Center spindle */}
            <div
              className="absolute rounded-full bg-white/25"
              style={{ inset: "calc(50% - 4px)", width: 8, height: 8 }}
            />
          </motion.div>

          {/* ── Vibe + Song Meta — z-20 (in front of disc) ── */}
          <div className="absolute bottom-24 left-8 md:left-12 z-20 flex flex-col gap-4 max-w-[85%]">
            <div className="space-y-4">
              <h1 className="font-dm-sans uppercase tracking-[0.05em] font-bold text-[clamp(44px,25%,90px)] text-shadow-editorial leading-[0.85] -ml-1 opacity-90">
                {pairing.vibe}
              </h1>
              <div className="flex flex-col gap-1 border-l border-white/20 pl-4 md:pl-6 py-0.5">
                <div className="flex items-center gap-2">
                  {isPlaying && <WaveformBars />}
                  <div className="font-dm-sans font-bold text-[clamp(9px,2.5vw,13px)] uppercase tracking-[.4em] text-text leading-snug">
                    {pairing.song_title}
                  </div>
                </div>
                <div className="font-dm-sans text-[clamp(8px,1.8vw,10px)] uppercase tracking-[.35em] text-muted leading-tight">
                  {pairing.artist}
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
