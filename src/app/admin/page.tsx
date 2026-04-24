"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Pairing } from "@/lib/data";
import { Check, X, Shield, Music, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pending, setPending] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Simple hardcoded check for now (or fetch from an API route)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "drift2026") {
      setIsAuthorized(true);
    } else {
      alert("Incorrect password.");
    }
  };

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pairings")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data) setPending(data as any);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) fetchPending();
  }, [isAuthorized]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const { error } = await supabase
      .from("pairings")
      .update({ status: "live" })
      .eq("id", id);

    if (!error) await fetchPending();
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    const { error } = await supabase
      .from("pairings")
      .delete()
      .eq("id", id);

    if (!error) await fetchPending();
    setProcessingId(null);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <Shield className="mx-auto text-muted mb-4" size={32} />
            <h1 className="font-cormorant italic text-3xl">drift admin</h1>
          </div>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 py-3 font-dm-sans text-sm focus:outline-none focus:border-white/30 transition-all text-center"
          />
          <button type="submit" className="w-full border border-white/10 py-4 font-dm-sans text-[10px] uppercase tracking-[.4em] hover:bg-white hover:text-black transition-all">
            Enter
          </button>
          <div className="text-center pt-4">
             <Link href="/" className="font-dm-sans text-[9px] uppercase tracking-widest text-muted2 hover:text-muted transition-colors">back to safety</Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-text font-dm-sans p-8 md:p-24 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="flex justify-between items-end border-b border-white/10 pb-12">
          <div className="space-y-4">
             <h1 className="font-cormorant italic text-5xl">the curation deck</h1>
             <p className="text-[10px] uppercase tracking-[.3em] text-muted">manage the drift network</p>
          </div>
          <button onClick={fetchPending} className="text-[9px] uppercase tracking-widest font-bold hover:text-muted transition-colors">
             Refresh ({pending.length})
          </button>
        </div>

        {loading ? (
           <div className="py-24 text-center text-muted animate-pulse font-dm-sans uppercase tracking-widest text-[10px]">fetching submissions...</div>
        ) : pending.length === 0 ? (
           <div className="py-24 text-center text-muted2 font-dm-sans uppercase tracking-[.4em] text-[10px]">no pending drift found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pending.map((item) => (
              <div key={item.id} className="group border border-white/5 bg-white/[0.02] p-8 flex flex-col md:flex-row items-center gap-12 hover:border-white/10 transition-all duration-700">
                <div className="w-48 aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                   <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-8 py-4">
                   <div className="space-y-2">
                      <div className="font-cormorant italic text-3xl">{item.song_title}</div>
                      <div className="text-muted text-[11px] uppercase tracking-widest">{item.artist}</div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[10px] uppercase tracking-widest text-muted2">
                      <div className="space-y-1">
                         <div className="opacity-40">Energy</div>
                         <div className="text-text">{Math.round(item.energy * 100)}%</div>
                      </div>
                      <div className="space-y-1">
                         <div className="opacity-40">Tempo</div>
                         <div className="text-text">{Math.round(item.tempo * 100)}%</div>
                      </div>
                      <div className="space-y-1">
                         <div className="opacity-40">Vibe</div>
                         <div className="text-text italic">{item.vibe || "—"}</div>
                      </div>
                      <div className="space-y-1">
                         <div className="opacity-40">Source</div>
                         <Link href={item.spotify_url || "#"} target="_blank" className="text-text hover:underline truncate inline-block max-w-[100px]">Spotify</Link>
                      </div>
                   </div>
                </div>

                <div className="flex md:flex-col gap-4">
                   <button 
                     onClick={() => handleApprove(item.id)}
                     disabled={processingId !== null}
                     className="p-4 border border-white/10 rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-500 disabled:opacity-30"
                     title="Approve & Go Live"
                   >
                      {processingId === item.id ? (
                         <Loader2 size={20} className="animate-spin" />
                      ) : (
                         <Check size={20} />
                      )}
                   </button>
                   <button 
                     onClick={() => handleReject(item.id)}
                     disabled={processingId !== null}
                     className="p-4 border border-white/10 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-500 disabled:opacity-30"
                     title="Reject & Delete"
                   >
                      <X size={20} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
