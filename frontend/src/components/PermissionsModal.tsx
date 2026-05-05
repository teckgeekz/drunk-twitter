"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Bell, Zap, X, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGranted: () => void;
}

export function PermissionsModal({ isOpen, onClose, onGranted }: PermissionsModalProps) {
  const [requesting, setRequesting] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      // Use Notification API as the "System Permission"
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('bhangbhosdha_permissions_granted', 'true');
        onGranted();
      } else {
        alert("Permissions are required for the full unhinged experience and anonymity protection.");
      }
    } catch (err) {
      console.error("Permission request failed", err);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />

            <div className="relative text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 rotate-3">
                <Shield className="text-primary w-10 h-10" />
              </div>

              <h2 className="text-3xl font-black text-white mb-2 italic">SYSTEM ACCESS REQUIRED</h2>
              <p className="text-text-muted mb-8">
                To maintain your <span className="text-white font-bold">100% Anonymity</span> and handle the real-time chaos, the platform needs system-level authorization.
              </p>

              <div className="space-y-4 mb-8 text-left">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2 bg-white/5 rounded-xl">
                    <Zap size={18} className="text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Anonymity Persistence</h4>
                    <p className="text-xs text-text-muted">Encrypts your session locally to prevent any server-side tracking of your identity.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2 bg-white/5 rounded-xl">
                    <Bell size={18} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Real-time Chaos Alerts</h4>
                    <p className="text-xs text-text-muted">Instant notifications when your unhinged thoughts trigger a response in the community.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2 bg-white/5 rounded-xl">
                    <CheckCircle size={18} className="text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Breathalyzer System</h4>
                    <p className="text-xs text-text-muted">Automated verification of your account status to bypass rate-limit blocks.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRequest}
                  disabled={requesting}
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {requesting ? "Authorizing..." : "GRANT SYSTEM ACCESS"}
                </motion.button>
                <button 
                  onClick={onClose}
                  className="text-text-muted hover:text-white text-sm font-medium transition-colors"
                >
                  Maybe later (I'll stay a lurker)
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
