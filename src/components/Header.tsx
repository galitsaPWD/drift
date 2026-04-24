"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export function Header() {
  const pathname = usePathname();
  const [driftCount, setDriftCount] = useState(12);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const supabase = createClient();
    const clientId = Math.random().toString(36).substring(7);

    const room = supabase.channel('online-users', {
      config: { presence: { key: clientId } },
    });

    room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState();
        let totalActive = 0;
        for (const key in newState) {
          totalActive += newState[key].length;
        }
        // At minimum 1 (the current user)
        setDriftCount(Math.max(1, totalActive));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(room);
    };
  }, []);

  if (!mounted) return null;

  return (
    <header className="absolute top-0 left-0 w-full z-[100] px-5 py-4 pointer-events-none">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center relative h-full">
        
        {/* Live Counter (Left) */}
        <div className="flex items-center gap-1.5 opacity-60" suppressHydrationWarning>
          <div className="w-[3px] h-[3px] rounded-full bg-white animate-pulse" suppressHydrationWarning />
          <span className="font-dm-sans text-[7px] md:text-[8px] uppercase tracking-[.2em] text-muted whitespace-nowrap" suppressHydrationWarning>
            {driftCount} drifting
          </span>
        </div>

        {/* Logo (Center) */}
        <Link 
          href="/about" 
          className="absolute left-1/2 -translate-x-1/2 pointer-events-auto font-dm-sans text-[11px] uppercase tracking-[.6em] hover:opacity-50 transition-opacity"
        >
          drift
        </Link>

        {/* Action Link (Right) */}
        <div className="flex gap-4 items-center pointer-events-auto" suppressHydrationWarning>
          {pathname !== "/submit" && (
            <Link 
              href="/submit" 
              className="font-dm-sans text-[10px] uppercase tracking-[.3em] text-text hover:opacity-50 transition-opacity"
            >
              Submit
            </Link>
          )}

          {pathname === "/admin" && (
             <div className="font-dm-sans text-[9px] uppercase tracking-[.4em] text-red-500/60">ADMIN</div>
          )}
        </div>

      </div>
    </header>
  );
}
