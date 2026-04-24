"use client";

import { useState } from "react";
import { Share2, Link as LinkIcon, Download, Loader2, Check } from "lucide-react";
import { Pairing } from "@/lib/data";
import { generateShareCard } from "@/lib/canvas";

interface Props {
  pairing: Pairing;
  currentIndex?: number;
  activePicIndex?: number;
}

export function ShareTrigger({ pairing, currentIndex, activePicIndex = 0 }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const dataUrl = await generateShareCard(pairing, activePicIndex, currentIndex);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `drift-${pairing.vibe.replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to generate share card", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.origin);
    url.searchParams.set("id", pairing.id);
    if (activePicIndex > 0) {
      url.searchParams.set("pic", activePicIndex.toString());
    }
    
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-8">
      {/* Download Card */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-3 font-dm-sans text-[10px] uppercase tracking-[.3em] text-muted hover:text-text transition-colors disabled:opacity-50 group"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin text-white" />
        ) : (
          <Download size={12} className="group-hover:translate-y-0.5 transition-transform" />
        )}
        <span>{loading ? "Rendering Mosaic..." : "Download Card"}</span>
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-3 font-dm-sans text-[10px] uppercase tracking-[.3em] text-muted hover:text-text transition-colors group"
      >
        {copied ? (
          <Check size={12} className="text-vibe-color" />
        ) : (
          <LinkIcon size={12} className="group-rotate-12 transition-transform" />
        )}
        <span className={copied ? "text-vibe-color" : ""}>
          {copied ? "Link Copied" : "Copy Link"}
        </span>
      </button>
    </div>
  );
}

