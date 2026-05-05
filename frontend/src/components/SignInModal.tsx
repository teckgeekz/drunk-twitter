"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Globe, UserRound, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { auth, provider, signInWithPopup, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "@/lib/firebase";

type AuthView = "main" | "email-login" | "email-register";

const adjectives = [
  "Swift", "Bold", "Chill", "Wild", "Neon", "Cosmic", "Stealthy", "Blazing", "Mystic", "Savage",
  "Silent", "Radiant", "Frozen", "Cryptic", "Atomic", "Wicked", "Lucky", "Phantom", "Rogue", "Vivid",
  "Electric", "Dark", "Golden", "Iron", "Shadow", "Turbo", "Hyper", "Ultra", "Zen", "Pixel"
];

const nouns = [
  "Panda", "Wolf", "Hawk", "Fox", "Cobra", "Raven", "Tiger", "Lynx", "Bear", "Falcon",
  "Otter", "Viper", "Phoenix", "Dragon", "Owl", "Shark", "Panther", "Jaguar", "Eagle", "Mantis",
  "Ghost", "Storm", "Flame", "Frost", "Spark", "Byte", "Node", "Comet", "Orbit", "Pulse"
];

function generateAnonName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
  return `${adj}${noun}${num}`;
}

export function SignInModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [view, setView] = useState<AuthView>("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setView("main");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, provider);
      handleClose();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInAnonymously(auth);
      const anonName = generateAnonName();
      await updateProfile(result.user, { displayName: anonName });
      handleClose();
    } catch (err: any) {
      setError(err.message || "Anonymous sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      if (view === "email-register") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      handleClose();
    } catch (err: any) {
      const code = err.code;
      if (code === "auth/user-not-found") setError("No account found with this email");
      else if (code === "auth/wrong-password") setError("Incorrect password");
      else if (code === "auth/email-already-in-use") setError("An account with this email already exists");
      else if (code === "auth/invalid-email") setError("Invalid email address");
      else if (code === "auth/weak-password") setError("Password is too weak");
      else if (code === "auth/invalid-credential") setError("Invalid email or password");
      else setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-2">
              <div className="flex items-center gap-3">
                {view !== "main" && (
                  <button onClick={() => { setView("main"); setError(""); }} className="text-text-muted hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-base shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                  B
                </div>
              </div>
              <button onClick={handleClose} className="text-text-muted hover:text-white transition-colors p-1 rounded-full hover:bg-surface-hover">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pb-8 pt-4">
              {view === "main" ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Join BhangBosdha</h2>
                  <p className="text-text-muted mb-8 text-sm">Choose how you want to sign in.</p>

                  <div className="flex flex-col gap-3">
                    {/* Google */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoogle}
                      disabled={loading}
                      className="flex items-center gap-4 w-full px-5 py-3.5 rounded-2xl bg-white text-black font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      <span>Continue with Google</span>
                    </motion.button>

                    {/* Email */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setView("email-login"); setError(""); }}
                      disabled={loading}
                      className="flex items-center gap-4 w-full px-5 py-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-white/10 text-white font-semibold transition-colors disabled:opacity-50"
                    >
                      <Mail size={22} />
                      <span>Continue with Email</span>
                    </motion.button>

                    <div className="flex items-center gap-4 my-2">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-text-muted text-xs uppercase tracking-wider">or</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Anonymous */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAnonymous}
                      disabled={loading}
                      className="flex items-center gap-4 w-full px-5 py-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-white/5 text-text-muted hover:text-white font-semibold transition-colors disabled:opacity-50"
                    >
                      <UserRound size={22} />
                      <span>Continue Anonymously</span>
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {view === "email-login" ? "Sign in" : "Create account"}
                  </h2>
                  <p className="text-text-muted mb-6 text-sm">
                    {view === "email-login" ? "Enter your email and password." : "Set up your new account."}
                  </p>

                  <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="text-sm text-text-muted mb-1.5 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoFocus
                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-text-muted mb-1.5 block">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full px-5 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold transition-colors disabled:opacity-50 mt-2"
                    >
                      {loading ? "Please wait..." : view === "email-login" ? "Sign In" : "Create Account"}
                    </motion.button>
                  </form>

                  <div className="mt-5 text-center text-sm text-text-muted">
                    {view === "email-login" ? (
                      <span>
                        Don&apos;t have an account?{" "}
                        <button onClick={() => { setView("email-register"); setError(""); }} className="text-primary hover:underline font-medium">
                          Sign up
                        </button>
                      </span>
                    ) : (
                      <span>
                        Already have an account?{" "}
                        <button onClick={() => { setView("email-login"); setError(""); }} className="text-primary hover:underline font-medium">
                          Sign in
                        </button>
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex items-start gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3"
                  >
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
