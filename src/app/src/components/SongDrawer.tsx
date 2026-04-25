"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { Pairing } from "@/lib/data";
import { ShareTrigger } from "@/components/ShareTrigger";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pairing: Pairing;
  discArt?: string | null;
  isPlaying?: boolean;
  currentIndex?: number;
  activePicIndex?: number;
}

function DrawerWaveform({ color }: { color: string }) {
  const bars = [
    { heights: [15, 30, 20, 45, 15], delay: 0 },
    { heights: [25, 15, 50, 20, 25], delay: 0.1 },
    { heights: [20, 40, 15, 35, 20], delay: 0.2 },
    { heights: [45, 25, 30, 15, 45], delay: 0.3 },
    { heights: [15, 30, 45, 20, 15], delay: 0.4 },
    { heights: [35, 15, 25, 50, 35], delay: 0.5 },
    { heights: [20, 45, 15, 30, 20], delay: 0.6 },
    { heights: [50, 20, 35, 15, 50], delay: 0.7 },
    { heights: [15, 35, 20, 40, 15], delay: 0.8 },
    { heights: [30, 15, 45, 25, 30], delay: 0.9 },
    { heights: [25, 50, 15, 35, 25], delay: 1.0 },
    { heights: [15, 25, 40, 20, 15], delay: 1.1 },
  ];
  return (
    <div className="flex items-center gap-1.5 md:gap-2.5 h-16">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          animate={{ height: bar.heights }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "mirror",
            delay: bar.delay,
            ease: "easeInOut",
          }}
          className="w-1.5 md:w-2 rounded-full"
          style={{ 
            minHeight: 4, 
            backgroundColor: color, 
            boxShadow: `0 0 12px ${color}` 
          }}
        />
      ))}
    </div>
  );
}

export function SongDrawer({ isOpen, onClose, pairing, discArt, isPlaying, currentIndex, activePicIndex }: Props) {
  const [dominantColor, setDominantColor] = useState<string>("#ffffff");

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.currentTarget; // Save reference before async closure
    if (!imgElement) return;

    // Dynamically import to ensure it only runs browser-side after image loads
    import("fast-average-color").then(({ FastAverageColor }) => {
      try {
        const fac = new FastAverageColor();
        const colorData = fac.getColor(imgElement);
        setDominantColor(colorData.hex);
        fac.destroy();
      } catch (err) {
        console.warn("Could not extract color from album art");
      }
    });
  };

  return (
    <AnimatePresence>      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] md:h-[48vh] bg-[#0c0c0c]/80 backdrop-blur-3xl border-t border-white/10 z-50 p-6 pt-12 md:px-16 md:py-16 flex flex-col md:flex-row gap-8 md:gap-16 overflow-y-auto rounded-t-3xl md:rounded-t-none shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)]"
          >
            {/* Mobile Drag Indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/20 rounded-full md:hidden" />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 md:top-8 md:right-8 text-muted hover:text-text transition-colors z-20 bg-white/5 md:bg-transparent rounded-full p-2 md:p-0 backdrop-blur-md md:backdrop-blur-none"
            >
              <X size={20} />
            </button>

            {/* Top Section: Thumbnail + Visualizer (Flex Row) */}
            <div className="flex items-center gap-8 md:gap-12 md:h-full flex-shrink-0">
              {/* Thumbnail — Album Art (Square) */}
              <div className="relative aspect-square w-32 md:w-auto md:h-full flex-shrink-0 group">
                 {/* Glowing shadow behind the album art */}
                 <div className="absolute inset-0 bg-white/10 blur-[30px] rounded-2xl opacity-60" />
                 
                 <div className="absolute inset-0 rounded-2xl md:rounded-xl overflow-hidden border border-white/10 z-10 shadow-2xl">
                   {discArt ? (
                     <img 
                       src={discArt} 
                       alt="album art" 
                       crossOrigin="anonymous"
                       onLoad={handleImageLoad}
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                     />
                   ) : (
                     <div className="w-full h-full bg-white/5 flex items-center justify-center font-dm-sans text-xs text-muted uppercase tracking-widest">
                       Art
                     </div>
                   )}
                 </div>
              </div>

              {/* Waveform Visualizer */}
              {isPlaying && (
                <div className="flex items-center flex-1">
                  <DrawerWaveform color={dominantColor} />
                </div>
              )}
            </div>

            {/* Content info */}
            <div className="flex flex-col justify-end gap-8 md:gap-10 flex-1 z-10">
              <div className="space-y-3 md:space-y-5">
                <h3 className="font-cormorant italic text-4xl md:text-6xl leading-[1.1] text-balance pr-8 text-text shadow-black drop-shadow-md">
                  {pairing.vibe}
                </h3>
                <div className="space-y-1">
                   <p className="font-dm-sans text-lg md:text-xl font-bold text-text">{pairing.song_title}</p>
                   <p className="font-dm-sans text-xs md:text-sm text-muted uppercase tracking-[0.2em]">{pairing.artist}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 md:gap-8 items-center pt-6 md:pt-8 border-t border-white/10">
                <ShareTrigger 
                   pairing={pairing} 
                   currentIndex={currentIndex} 
                   activePicIndex={activePicIndex} 
                />
                
                {pairing.spotify_url && (
                  <a 
                    href={pairing.spotify_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-dm-sans text-[10px] uppercase tracking-[.3em] text-muted hover:text-white transition-colors"
                  >
                    Listen on Spotify <ExternalLink size={12} />
                  </a>
                )}
                
                {pairing.image_credit && (
                  <span className="font-dm-sans text-[10px] uppercase tracking-[.3em] text-muted2">
                    Credit: {pairing.image_credit}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
