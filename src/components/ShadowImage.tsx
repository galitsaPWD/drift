"use client";

import Image from "next/image";

interface Props {
  src: string;
}

/**
 * SHADOW IMAGE: A tiny, hidden component that forces the browser and Next.js 
 * to decode and cache the high-res pixels for neighboring pairings.
 * This is the 'secret' to zero-latency visual switches.
 */
export function ShadowImage({ src }: Props) {
  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 overflow-hidden opacity-0 pointer-events-none -z-[100]"
      aria-hidden="true"
    >
      {/* Heavy weight pre-load for the actual full-res raw asset */}
       <Image
        src={src}
        alt="shadow-full-preload"
        fill
        priority
        unoptimized={true}
        sizes="100vw"
      />
    </div>
  );
}
