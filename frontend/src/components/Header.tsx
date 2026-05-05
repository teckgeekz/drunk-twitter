"use client";

import { useAuth } from "./AuthProvider";
import { auth, signOut } from "@/lib/firebase";
import { SignInModal } from "./SignInModal";
import { LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Beer } from "lucide-react";

export function Header() {
  const { user, loading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-black">
              <Beer size={32} />
            </div>
            Drunk Twitter
          </div>

          {!loading && (
            <div>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-muted hidden sm:inline-block">
                    {user.isAnonymous ? "Anonymous" : `@${user.email?.split("@")[0]}`}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover text-sm font-medium transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSignIn(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </motion.button>
              )}
            </div>
          )}
        </div>
      </header>

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  );
}
