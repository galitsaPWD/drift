"use client";

import { Howl } from "howler";

class AudioEngine {
  private howls = new Map<string, Howl>();
  private activeId: string | null = null;
  private volume: number = 0.6;

  onLoadError: ((id: string) => void) | null = null;

  private getFinalUrls(url: string | null): string[] {
    if (!url) return [];
    
    const isCorsReady = 
      url.includes("scdn.co") || 
      url.includes("akamaized.net") || 
      url.includes("spotify.com") ||
      url.includes("dzcdn.net") || 
      url.includes("fbcdn.net");

    // If CORS-ready, try direct FIRST, then proxy as fallback
    if (isCorsReady) {
      return [url, `/api/music/proxy?url=${encodeURIComponent(url)}` ];
    }

    // Default: try Proxy FIRST, then direct as a desperate fallback
    return [ `/api/music/proxy?url=${encodeURIComponent(url)}`, url ];
  }

  /**
   * PRIME: Background load the audio for a future pairing.
   */
  async prime(id: string, url: string | null) {
    if (this.howls.has(id) || !url) return;

    if (this.howls.size >= 5) {
      const firstId = Array.from(this.howls.keys()).find(k => k !== this.activeId);
      if (firstId) this.evict(firstId);
    }

    const sources = this.getFinalUrls(url);
    
    const howl = new Howl({
      src: sources,
      html5: true,
      format: ['mp3'],
      loop: true,
      volume: 0,
      autoplay: false,
    });

    howl.on('loaderror', (hid, err) => {
      console.warn(`[AudioEngine] Pre-load fail for ${id}:`, err);
      this.howls.delete(id);
    });

    this.howls.set(id, howl);
  }

  async play(id: string, url: string | null) {
    // 1. If already playing this ID, skip
    if (this.activeId === id) return;

    // 2. Resolve or Create the Howl
    let howl = this.howls.get(id);
    
    if (!howl) {
      if (!url) return;
      await this.prime(id, url);
      howl = this.howls.get(id);
    }

    // 3. Stop old, play new
    if (this.activeId && this.howls.has(this.activeId)) {
      const oldHowl = this.howls.get(this.activeId);
      oldHowl?.fade(this.volume, 0, 800);
      setTimeout(() => oldHowl?.stop(), 800);
    }

    if (howl) {
      this.activeId = id;
      howl.play();
      howl.fade(0, this.volume, 1200);
    }
  }

  evict(id: string) {
    if (id === this.activeId) return;
    const howl = this.howls.get(id);
    if (howl) {
      howl.stop();
      howl.unload();
      this.howls.delete(id);
    }
  }

  // Clear everything out of the neighbor radius
  syncPool(keepIds: string[]) {
    this.howls.forEach((_, id) => {
      if (!keepIds.includes(id)) {
        this.evict(id);
      }
    });
  }

  setVolume(v: number) {
    this.volume = v;
    this.howls.get(this.activeId || "")?.volume(v);
  }

  resume() {
    // @ts-ignore
    if (typeof Howler !== 'undefined' && Howler.ctx && Howler.ctx.state === "suspended") {
      Howler.ctx.resume();
    }
  }

  stop() {
    this.howls.forEach(h => {
      h.stop();
      h.unload();
    });
    this.howls.clear();
    this.activeId = null;
  }
}

export const audioEngine = typeof window !== "undefined" ? new AudioEngine() : null;
