"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const SWIPE_THRESHOLD = 35; // px to register as a swipe
const DOUBLE_TAP_MS = 300;  // ms window for double-tap

export function useDrift(
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void,
  onDoubleTap?: () => void,
) {
  const [pos, setPos] = useState({ px: 0.5, py: 0.5 });
  const posRef = useRef({ px: 0.5, py: 0.5 });

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const lastTapTime = useRef(0);
  const lastTapPos = useRef<{ x: number; y: number } | null>(null);

  const wrapVal = (v: number) => ((v % 1) + 1) % 1;

  const snapTo = useCallback((px: number, py: number) => {
    const wrapped = { px: wrapVal(px), py: wrapVal(py) };
    posRef.current = wrapped;
    setPos(wrapped);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onSwipe?.('right');
      if (e.key === 'ArrowLeft') onSwipe?.('left');
      if (e.key === 'ArrowUp') onSwipe?.('up');
      if (e.key === 'ArrowDown') onSwipe?.('down');
    };

    const handlePointerDown = (e: PointerEvent) => {
      const now = Date.now();
      const x = e.clientX;
      const y = e.clientY;

      if (
        lastTapPos.current &&
        now - lastTapTime.current < DOUBLE_TAP_MS &&
        Math.abs(x - lastTapPos.current.x) < 40 &&
        Math.abs(y - lastTapPos.current.y) < 40
      ) {
        onDoubleTap?.();
        lastTapTime.current = 0;
        lastTapPos.current = null;
        return;
      }

      lastTapTime.current = now;
      lastTapPos.current = { x, y };
      startPos.current = { x, y };
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!startPos.current) return;

      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Threshold for a "real" swipe (30px)
      if (dist > 30) {
        if (Math.abs(dx) > Math.abs(dy)) {
          onSwipe?.(dx > 0 ? 'right' : 'left');
        } else {
          onSwipe?.(dy > 0 ? 'down' : 'up');
        }
      }

      startPos.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [snapTo, onDoubleTap, onSwipe]);

  return { ...pos, snapTo };
}
