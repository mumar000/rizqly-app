"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/budget");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signUp(email, password, fullName);
      router.push("/budget");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const floatingEmojis = ["🚀", "💎", "✨", "🌟", "🔥", "👑"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0A0A0C]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingEmojis.map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-10"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
            }}
            animate={{
              y: [null, Math.random() * -100 - 50, null],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#CCFF00]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#CCFF00] text-[10px] font-black uppercase tracking-[0.3em] mb-6"
          >
            New Era of Finance
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            CREATE ACCOUNT
          </h1>
          <p className="text-white/40 text-sm font-medium">
            Join 10,000+ Gen-Zers securing the bag
          </p>
        </div>

        <div
          className="glass rounded-[40px] p-8 relative overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(40px)",
          }}
        >
          {/* Subtle decorative ring */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full border border-white/5 pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                Your Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#CCFF00] transition-all text-white placeholder:text-white/10 font-medium"
                placeholder="Gen Z Legend"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#CCFF00] transition-all text-white placeholder:text-white/10 font-medium"
                placeholder="you@rizz.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                Secure Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#CCFF00] transition-all text-white placeholder:text-white/10 font-medium"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-[24px] font-black text-black bg-[#CCFF00] hover:bg-[#ddff33] transition-all disabled:opacity-50 shadow-[0_20px_40px_rgba(204,255,0,0.15)] flex items-center justify-center gap-3 uppercase tracking-tighter"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="text-xl">🚀</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/auth">
              <span className="text-xs text-white/30 hover:text-white transition-colors cursor-pointer font-bold uppercase tracking-widest">
                Already a member?{" "}
                <span className="text-[#CCFF00]">Login here</span>
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
