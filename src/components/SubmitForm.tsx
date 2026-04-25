"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Check, AlertCircle, Loader2, Wand2, Plus, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ImageCropper } from "./ImageCropper";
import { FastAverageColor } from "fast-average-color";

export function SubmitForm() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  // Lookbook (Multi-pic) State
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  
  // Cropper State
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropType, setCropType] = useState<{ index: number | 'primary' }>({ index: 'primary' });
  
  // Form State
  const [vibe, setVibe] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [energy, setEnergy] = useState(0.5);
  const [tempo, setTempo] = useState(0.5);
  
  // Auto-Scan Logic
  const [isScanning, setIsScanning] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Resolved Data from Spotify/Deezer
  const [resolvedData, setResolvedData] = useState<{
    song_title?: string;
    artist?: string;
    preview_url?: string;
    image_url?: string;
    energy?: number;
    tempo?: number;
    spotify_url?: string;
  } | null>(null);
  const [resolving, setResolving] = useState(false);

  // Auto-resolve Spotify Links
  useEffect(() => {
    if (!spotifyUrl.includes("spotify.com/track/")) return;

    const resolveTrack = async () => {
      setResolving(true);
      try {
        const res = await fetch(`/api/music/resolve?url=${encodeURIComponent(spotifyUrl)}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        
        if (data.song_title) {
          setResolvedData({
            ...data,
            energy: data.energy ?? 0.5,
            tempo: data.tempo ?? 0.5
          });
          
          // Auto-populate sliders from Spotify Audio DNA
          setEnergy(data.energy ?? 0.5);
          setTempo(data.tempo ?? 0.5);
          
          // Only update preview with album art if the user hasn't uploaded their own photo
          if (!file && data.image_url) {
            setPreview(data.image_url);
          }
        }
      } catch (err) {
        console.error("Resolve failed:", err);
      } finally {
        setResolving(false);
      }
    };

    const timer = setTimeout(resolveTrack, 500);
    return () => clearTimeout(timer);
  }, [spotifyUrl]);

  const scanVibe = async () => {
    // Capture a snapshot of the preview to prevent race conditions
    const currentPreview = preview;
    if (!currentPreview || currentPreview.trim() === "") {
      console.warn("Vibe scan aborted: No silhouette present.");
      return;
    }
    
    setIsScanning(true);
    
    try {
      const fac = new FastAverageColor();
      
      // 1. Create a shadow image buffer to verify resource integrity and dimensions
      const img = new (window as any).Image();
      img.crossOrigin = "anonymous";
      img.src = currentPreview;

      // 2. Wait for the image to be fully decoded and ready for canvas reading
      const color = await new Promise<any>((resolve, reject) => {
        img.onload = () => {
          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            reject(new Error("Invalid image dimensions"));
            return;
          }
          try {
            const result = fac.getColor(img);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = () => reject(new Error("Image failed to load"));

        // Timeout guard to prevent infinite scanning state
        setTimeout(() => reject(new Error("Scan timed out")), 5000);
      }).catch(err => {
        console.error("Vibe Extraction Error:", err);
        return null;
      });

      if (!color) {
        setIsScanning(false);
        fac.destroy();
        return;
      }
      
      // Simulate "AI Scan" with a slight delay
      await new Promise(r => setTimeout(r, 1200));
      
      // Heuristic: Darker = Lower Energy/Tempo, Brighter = Higher
      const luminance = (color.value[0] + color.value[1] + color.value[2]) / (255 * 3);
      fac.destroy();
      
      // Map luminance to OUTFIT ENERGY (Loud vs. Quiet visual)
      const targetEnergy = Math.max(0.2, Math.min(0.9, luminance * 1.2));
      
      setEnergy(parseFloat(targetEnergy.toFixed(2)));
      // Tempo is now reserved for the Curated Music Speed, not auto-scanned from image.
      
    } catch (err) {
      console.error("Vibe scan failed:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vibe || vibe.trim() === "") {
      setErrorMessage("Please enter a vibe phrase.");
      setStatus("error");
      return;
    }

    if (!resolvedData || !resolvedData.song_title) {
      setErrorMessage("Please enter a valid Spotify track link.");
      setStatus("error");
      return;
    }

    if (!resolvedData.preview_url) {
      setErrorMessage("Spotify restricts this track's audio. Please select a different song.");
      setStatus("error");
      return;
    }

    if (!file && !resolvedData?.image_url) {
      setErrorMessage("Please upload a photo.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    
    try {
      let finalImageUrl = resolvedData?.image_url || "";
      let finalAdditionalUrls: string[] = [];

      // 1. Upload Primary User Photo
      if (file) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `p-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('pairings')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('pairings')
          .getPublicUrl(fileName);
        
        finalImageUrl = publicUrl;
      }

      // 2. Upload Additional Photos (Lookbook)
      for (const addFile of additionalFiles) {
        const fileExt = addFile.name.split('.').pop() || 'jpg';
        const fileName = `a-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: addError } = await supabase.storage
          .from('pairings')
          .upload(fileName, addFile);

        if (addError) throw addError;

        const { data: { publicUrl } } = supabase.storage
          .from('pairings')
          .getPublicUrl(fileName);
        
        finalAdditionalUrls.push(publicUrl);
      }

      // 3. Insert into pairings
      const { error } = await supabase.from("pairings").insert([
        {
          image_url: finalImageUrl,
          additional_images: finalAdditionalUrls.length > 0 ? finalAdditionalUrls : null,
          vibe: vibe.toLowerCase(),
          song_title: resolvedData?.song_title || "Unknown",
          artist: resolvedData?.artist || "Unknown",
          spotify_url: spotifyUrl,
          preview_url: resolvedData?.preview_url || null,
          energy,
          tempo,
          status: "live",
          ghost_index: "00", 
        }
      ]);

      if (error) throw error;
      setStatus("success");
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, filter: "blur(20px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
      >
        {preview && (
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1.0, opacity: 0.2 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src={preview}
            alt="Submitted pairing"
            className="absolute inset-0 w-full h-full object-cover grayscale brightness-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative z-10 flex flex-col items-center gap-8"
        >
          {/* Spinning Premium Record Icon */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 rounded-full border border-white/20 flex items-center justify-center relative shadow-[0_0_60px_rgba(255,255,255,0.05)]"
          >
            <div className="absolute inset-2 border border-white/10 rounded-full" />
            <div className="absolute inset-4 border border-white/[0.03] rounded-full" />
            <div className="absolute inset-8 border border-white/[0.05] rounded-full" />
            <div className="w-1.5 h-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-full relative z-10" />
            {resolvedData?.image_url && !file && (
               <img src={resolvedData.image_url} className="absolute inset-[30px] rounded-full object-cover opacity-30 grayscale" />
            )}
          </motion.div>

          <div className="flex flex-col items-center gap-3">
             <h2 className="font-cormorant italic text-5xl md:text-6xl text-white">paired.</h2>
             <p className="font-dm-sans text-[9px] md:text-[10px] uppercase tracking-[.3em] text-muted/60 text-center max-w-[240px] leading-relaxed">
               Your taste has been committed to the stack.
             </p>
          </div>

          <Link 
            href="/" 
            className="mt-6 font-dm-sans text-[10px] uppercase tracking-[.4em] text-white flex items-center justify-center py-4 px-10 border border-white/15 rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.0)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            Return
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div suppressHydrationWarning className="relative min-h-screen w-full bg-[#050505] text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        {preview && (
          <motion.div 
            key={preview}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            <img 
              src={preview} 
              alt="ambient-mirror" 
              className="w-full h-full object-cover blur-[80px] grayscale-50 brightness-[0.3] scale-110"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
            <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div suppressHydrationWarning className="relative z-10 max-w-[1400px] mx-auto px-6 py-12 md:py-24">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-16 lg:gap-32 items-start">
          
          {/* LEFT COLUMN: THE DIGITAL SILHOUETTE */}
          <div className="lg:sticky lg:top-24 space-y-12">
            <div className="space-y-4">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.4, y: 0 }}
                className="font-dm-sans text-[8px] uppercase tracking-[.8em]"
              >
                established 2026
              </motion.span>
              <h2 className="font-cormorant italic text-5xl md:text-6xl">drop a pairing.</h2>
            </div>

            <div className="relative h-[480px] w-full flex items-center justify-center overflow-visible select-none py-4">
              {/* Progressive unlocked count based on filled boxes */}
              {(() => {
                const unlockedCount = preview ? (additionalPreviews[0] ? 3 : 2) : 1;
                return (
                  <>
                    <AnimatePresence initial={false}>
                      {[0, 1, 2].map((i) => {
                        if (i >= unlockedCount) return null;

                        const offset = i - activeIndex;
                        const isPrimary = i === 0;
                        const currentPreview = isPrimary ? preview : additionalPreviews[i - 1];

                        return (
                          <motion.div 
                            key={i}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, info) => {
                              const threshold = 100;
                              if (info.offset.x > threshold && activeIndex > 0) setActiveIndex(v => v - 1);
                              else if (info.offset.x < -threshold && activeIndex < unlockedCount - 1) setActiveIndex(v => v + 1);
                            }}
                            animate={{ 
                              opacity: 1 - Math.abs(offset) * 0.4,
                              scale: 1 - Math.abs(offset) * 0.1,
                              x: offset * 45,
                              y: Math.abs(offset) * 15,
                              rotate: offset * 10,
                              zIndex: 10 - Math.abs(offset),
                              filter: Math.abs(offset) > 0 ? "blur(4px)" : "blur(0px)",
                            }}
                            className={`absolute aspect-[3/4] w-full max-w-[340px] bg-[#0A0A0A] border rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl transition-colors
                              ${Math.abs(offset) === 0 ? 'border-border/40' : 'border-border/10'}
                            `}
                          >
                            {currentPreview ? (
                              <div className="relative w-full h-full">
                                <img 
                                  src={currentPreview} 
                                  alt={`Slot ${i+1}`} 
                                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 pointer-events-none 
                                    ${offset === 0 ? 'grayscale-0 brightness-110' : 'grayscale brightness-50'}`} 
                                />
                                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 font-dm-sans text-[8px] uppercase tracking-[.3em] text-white">
                                  {isPrimary ? 'Primary silhouette' : `Lookbook shot 0${i}`}
                                </div>
                                {isPrimary && status === "idle" && offset === 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      scanVibe();
                                    }}
                                    disabled={isScanning}
                                    className="absolute bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-20"
                                  >
                                    {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                                  </button>
                                )}

                                {/* DELETE BUTTON */}
                                {currentPreview && offset === 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isPrimary) {
                                        setFile(null);
                                        setPreview(null);
                                        setResolvedData(null);
                                      } else {
                                        const idx = i - 1;
                                        setAdditionalFiles(prev => prev.filter((_, index) => index !== idx));
                                        setAdditionalPreviews(prev => prev.filter((_, index) => index !== idx));
                                      }
                                    }}
                                    className="absolute top-6 right-6 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/40 hover:text-white hover:bg-black/60 transition-all z-30 group/del"
                                  >
                                    <X size={14} className="group-hover/del:rotate-90 transition-transform" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full pointer-events-none gap-6 bg-white/[0.01]">
                                <motion.div 
                                  animate={offset === 0 ? { scale: [1, 1.1, 1] } : {}}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className={`w-16 h-16 border border-white/10 rounded-full flex items-center justify-center transition-colors ${offset === 0 ? 'bg-white/5 border-white/30' : ''}`}
                                >
                                  <Plus size={24} className={offset === 0 ? "text-white" : "text-muted/40"} />
                                </motion.div>
                                <span className="font-dm-sans text-[9px] uppercase tracking-[.4em] text-muted/60">
                                  {isPrimary ? 'Add Silhouette' : `Add Archive 0${i}`}
                                </span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              disabled={Math.abs(offset) !== 0}
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={(e) => {
                                const selectedFile = e.target.files?.[0];
                                if (selectedFile) {
                                  setCropSource(URL.createObjectURL(selectedFile));
                                  setCropType({ index: isPrimary ? 'primary' : i - 1 });
                                }
                              }}
                            />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Tightened Indicator Row */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                      {[0, 1, 2].map(i => {
                        const isUnlocked = i < unlockedCount;
                        const isFilled = i === 0 ? !!preview : !!additionalPreviews[i-1];
                        const isActive = i === activeIndex;

                        if (!isUnlocked) return null;

                        return (
                          <div key={i} className="flex items-center justify-center w-5 h-5">
                            {(!isFilled && i > 0) ? (
                              <motion.div animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <Plus size={14} className="text-white" />
                              </motion.div>
                            ) : (
                              <div className={`transition-all duration-500 
                                ${isActive ? 'w-4 h-1 bg-white' : 'w-1.5 h-1.5 rounded-full bg-white/20'}`} 
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
            
            {preview && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} className="text-center font-dm-sans text-[8px] uppercase tracking-[.4em]">
                swipe to add archives
              </motion.div>
            )}
          </div>

          {/* RIGHT COLUMN: THE DNA CONSOLE */}
          <div className="relative pt-10">
            <div className="space-y-8 relative z-10">
              {status === "error" && (
                <div className="p-4 border border-red-500/10 bg-red-500/5 rounded-2xl flex items-center gap-4 text-red-500/60 font-dm-sans text-[9px] uppercase tracking-[.2em] mb-4">
                  <AlertCircle size={14} />
                  {errorMessage || "Sequence failed. verify parity."}
                </div>
              )}

              {/* Module 01: Digital Link */}
              <div className="rounded-[2.5rem] bg-white/[0.03] border border-white/[0.05] p-10 space-y-6 hover:border-white/10 transition-all duration-700">
                <div className="flex justify-between items-center font-dm-sans text-[8px] uppercase tracking-[.4em] text-muted/40 px-2">
                   <div className="flex items-center gap-3">
                     <motion.div 
                        animate={spotifyUrl ? { scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${spotifyUrl ? 'bg-white shadow-[0_0_12px_white]' : 'bg-white/10'}`} 
                     />
                     <span>01. Digital link</span>
                   </div>
                   {resolving && <Loader2 size={10} className="animate-spin text-white/20" />}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Spotify URL"
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    className="w-full bg-transparent px-2 py-3 font-dm-sans text-sm focus:outline-none transition-all placeholder:text-white/5 border-none ring-0 outline-none"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: spotifyUrl ? '100%' : '0%' }}
                    className="absolute bottom-0 left-0 h-px bg-white/30 shadow-[0_0_10px_white]"
                  />
                </div>
                {resolvedData?.song_title && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 pt-2 px-2">
                    <div className="w-1 h-1 rounded-full bg-green-500/40" />
                    <span className="text-[8px] uppercase tracking-[.2em] text-white/30 truncate select-none">{resolvedData.song_title} // {resolvedData.artist}</span>
                  </motion.div>
                )}
              </div>

              {/* Module 02: Aesthetic Marker */}
              <div className="rounded-[2.5rem] bg-white/[0.03] border border-white/[0.05] p-10 space-y-6 hover:border-white/10 transition-all duration-700">
                <div className="flex items-center gap-3 font-dm-sans text-[8px] uppercase tracking-[.4em] text-muted/40 px-2">
                   <motion.div 
                      animate={vibe ? { scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${vibe ? 'bg-white shadow-[0_0_12px_white]' : 'bg-white/10'}`} 
                   />
                   <span>02. Aesthetic marker</span>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="cathedral light"
                    maxLength={40}
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className="w-full bg-transparent px-2 py-3 font-dm-sans text-sm focus:outline-none transition-all placeholder:text-white/5 placeholder:italic border-none ring-0 outline-none"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: vibe ? '100%' : '0%' }}
                    className="absolute bottom-0 left-0 h-px bg-white/30 shadow-[0_0_10px_white]"
                  />
                </div>
              </div>

              {/* Module 03: DNA Sliders */}
              <div className="rounded-[2.5rem] bg-white/[0.03] border border-white/[0.05] p-10 space-y-12">
                {/* Energy */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-[8px] uppercase tracking-[.4em] font-dm-sans text-muted/40 px-2">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_white]" />
                       <span>03. OUTFIT ENERGY</span>
                    </div>
                    <span className="text-white/40 tracking-[.2em]">{Math.round(energy * 100)}%</span>
                  </div>
                  <div className="relative h-1 bg-white/[0.04] w-full rounded-full">
                     <motion.div 
                        className="absolute inset-y-0 left-0 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]" 
                        style={{ width: `${energy * 100}%` }}
                      >
                        {/* THE THUMB HANDLE */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_15px_white] z-30" />
                      </motion.div>
                     <input 
                      type="range" 
                      min="0" 
                      max="1"
                      step="0.01" 
                      value={energy}
                      onChange={(e) => setEnergy(parseFloat(e.target.value))}
                      className="absolute -inset-y-4 w-full opacity-0 cursor-ew-resize z-20"
                    />
                  </div>
                </div>

                {/* Tempo */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-[8px] uppercase tracking-[.4em] font-dm-sans text-muted/40 px-2">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_white]" />
                       <span>04. MUSIC TEMPO</span>
                    </div>
                    <span className="text-white/40 tracking-[.2em]">{Math.round(tempo * 100)}%</span>
                  </div>
                  <div className="relative h-1 bg-white/[0.04] w-full rounded-full">
                     <motion.div 
                        className="absolute inset-y-0 left-0 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]" 
                        style={{ width: `${tempo * 100}%` }}
                      >
                         {/* THE THUMB HANDLE */}
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_15px_white] z-30" />
                      </motion.div>
                     <input 
                      type="range" 
                      min="0" 
                      max="1"
                      step="0.01" 
                      value={tempo}
                      onChange={(e) => setTempo(parseFloat(e.target.value))}
                      className="absolute -inset-y-4 w-full opacity-0 cursor-ew-resize z-20"
                    />
                  </div>
                </div>
              </div>

              {/* RITUAL COMMITTAL */}
              <div className="pt-10 space-y-6">
                <button 
                  type="submit"
                  disabled={status === "submitting" || resolving || !spotifyUrl || (!resolvedData?.song_title && spotifyUrl !== "") || !vibe.trim() || !resolvedData?.preview_url || (!file && !resolvedData?.image_url)}
                  className={`w-full py-9 font-dm-sans text-[10px] uppercase tracking-[.8em] transition-all duration-700 rounded-[2rem] border
                    ${status === "submitting" || resolving || !spotifyUrl || (!resolvedData?.song_title && spotifyUrl !== "") || !vibe.trim() || !resolvedData?.preview_url || (!file && !resolvedData?.image_url)
                      ? "border-white/5 text-muted/40 bg-transparent cursor-not-allowed"
                      : "border-white/10 bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_60px_rgba(255,255,255,0.1)]"
                    }`}
                >
                   {status === "submitting" ? "COMMITTING..." : "COMMIT TO GRID"}
                </button>

                <div className="text-center pb-24">
                   <Link href="/" className="font-dm-sans text-[8px] uppercase tracking-[.4em] text-muted/40 hover:text-white transition-all duration-700">
                      Discard sequence
                   </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {cropSource && (
          <ImageCropper
            image={cropSource}
            onCancel={() => setCropSource(null)}
            onCropComplete={(blob) => {
              const croppedPreview = URL.createObjectURL(blob);
              const croppedFile = new File([blob], "crop.jpg", { type: "image/jpeg" });
              
              if (cropType.index === 'primary') {
                setFile(croppedFile);
                setPreview(croppedPreview);
              } else {
                setAdditionalFiles(prev => {
                  const news = [...prev];
                  news[cropType.index as number] = croppedFile;
                  return news;
                });
                setAdditionalPreviews(prev => {
                  const news = [...prev];
                  news[cropType.index as number] = croppedPreview;
                  return news;
                });
              }
              setCropSource(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
