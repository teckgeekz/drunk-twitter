"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertCircle, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { auth } from "@/lib/firebase";

import { Post } from "./PostItem";

export function ComposeModal({ isOpen, onClose, onPostSuccess, replyTo }: {
  isOpen: boolean;
  onClose: () => void;
  onPostSuccess?: (post: any) => void;
  replyTo?: Post;
}) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 650;
  const currentLength = content.length;
  const isNearLimit = currentLength > 600;
  const isOverLimit = currentLength > maxLength;
  const isValid = currentLength > 0 && !isOverLimit && !isSubmitting;

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [content]);

  const handleSubmit = async () => {
    if (!isValid || !user) return;
    setIsSubmitting(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const apiUrl = getApiUrl();
      
      const res = await fetch(`${apiUrl}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: content.trim(),
          ...(replyTo && { replyToId: replyTo.id, replyToHandle: replyTo.authorHandle || replyTo.authorName })
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to post");
      }

      setContent("");
      onPostSuccess?.(data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || "Anonymous";
  const avatarLetter = displayName[0].toUpperCase();

  // Render @mentions with highlight
  const renderPreview = () => {
    return content.replace(/@([a-z0-9_]{3,30})/gi, '<span class="text-primary">@$1</span>');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={
              error && error.includes("Wait a minute") 
                ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-lg glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <button onClick={onClose} className="text-text-muted hover:text-white transition-colors p-1 rounded-full hover:bg-surface-hover">
                <X size={20} />
              </button>
              <motion.button
                whileHover={isValid ? { scale: 1.05 } : {}}
                whileTap={isValid ? { scale: 0.95 } : {}}
                onClick={handleSubmit}
                disabled={!isValid}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-colors ${
                  isValid 
                    ? "bg-primary text-white hover:bg-primary-hover" 
                    : "bg-surface-hover text-text-muted cursor-not-allowed"
                }`}
              >
                <span>Post</span>
                <Send size={14} />
              </motion.button>
            </div>

            <div className="p-4">
              {replyTo && (
                <div className="flex items-center gap-2 mb-4 text-sm text-text-muted">
                  <span>Replying to</span>
                  <span className="text-primary font-medium">@{replyTo.authorHandle || replyTo.authorName}</span>
                </div>
              )}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-hover flex-shrink-0 flex items-center justify-center font-bold text-lg text-primary">
                  {avatarLetter}
                </div>
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={replyTo ? "Write your reply..." : "What's happening?"}
                    className="w-full bg-transparent text-white text-lg placeholder:text-text-muted resize-none focus:outline-none min-h-[120px] overflow-hidden"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-sm flex items-center gap-1 mt-2 bg-red-500/10 rounded-xl px-4 py-2"
                  >
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className={`text-sm font-medium transition-colors ${
                  isOverLimit ? "text-red-400" : isNearLimit ? "text-yellow-500" : "text-text-muted"
                }`}>
                  {currentLength} / {maxLength}
                </div>
                <p className="text-xs text-text-muted">
                  Use <span className="text-primary">@handle</span> to mention someone
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
