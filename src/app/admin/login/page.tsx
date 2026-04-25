"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-[100dvh] bg-black flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000">
         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[180px] opacity-[0.05]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[360px] relative z-10 space-y-12"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <ShieldCheck size={18} className="text-muted" />
             <h1 className="font-dm-sans text-[11px] uppercase tracking-[.6em] text-text">
                Dashboard Access
             </h1>
          </div>
          <p className="font-cormorant italic text-3xl text-text leading-tight text-shadow-editorial">
             Enter the ritual code.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-2 group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ritual code"
              className="w-full bg-transparent border-b border-white/10 py-3 font-dm-sans text-[11px] uppercase tracking-[.4em] placeholder:text-muted2 focus:outline-none focus:border-white transition-colors"
              autoFocus
            />
            {status === "error" && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-red-500/60 pt-2"
                >
                    <AlertCircle size={10} />
                    <span className="font-dm-sans text-[8px] uppercase tracking-[.2em]">Rejected — Incorrect Code</span>
                </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full group flex items-center justify-center gap-3 bg-white/[0.03] border border-white/5 py-4 rounded-sm font-dm-sans text-[10px] uppercase tracking-[.5em] text-text hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {status === "loading" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              "Authorize"
            )}
          </button>
        </form>

        <div className="pt-8 text-center">
            <button 
                onClick={() => router.push("/")}
                className="font-dm-sans text-[9px] uppercase tracking-[.3em] text-muted2 hover:text-muted transition-colors"
            >
                return to drift
            </button>
        </div>
      </motion.div>
    </main>
  );
}
