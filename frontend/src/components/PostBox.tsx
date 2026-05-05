"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertCircle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getApiUrl } from "@/lib/api";

export function PostBox({ onPostSuccess }: { onPostSuccess: (post: any) => void }) {
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(64, textareaRef.current.scrollHeight)}px`;
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
        body: JSON.stringify({ content: content.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to post");
      }

      setContent("");
      onPostSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center border-b border-white/5 bg-surface/30">
        <h2 className="text-xl font-semibold mb-2">Join the conversation</h2>
        <p className="text-text-muted mb-4">Sign in to post your thoughts.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-white/5 bg-surface/50">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-hover flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-lg text-primary">
          {user.displayName?.[0].toUpperCase() || user.email?.[0].toUpperCase() || "A"}
        </div>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-transparent text-white text-lg placeholder:text-text-muted resize-none focus:outline-none min-h-[64px] overflow-hidden"
            disabled={isSubmitting}
          />
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={
                  error.includes("Wait a minute")
                    ? { opacity: 1, height: "auto", x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }
                    : { opacity: 1, height: "auto" }
                }
                exit={{ opacity: 0, height: 0 }}
                className="text-error text-sm flex items-center gap-1 mt-2 mb-2 bg-error/10 p-2 rounded-lg"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <div className={`text-sm font-medium transition-colors ${
              isOverLimit ? "text-error" : isNearLimit ? "text-yellow-500" : "text-text-muted"
            }`}>
              {currentLength} / {maxLength}
            </div>
            <motion.button
              whileHover={isValid ? { scale: 1.05, boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)" } : {}}
              whileTap={isValid ? { scale: 0.95 } : {}}
              onClick={handleSubmit}
              disabled={!isValid}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold transition-colors ${
                isValid 
                  ? "bg-primary text-white hover:bg-primary-hover" 
                  : "bg-surface-hover text-text-muted cursor-not-allowed"
              }`}
            >
              <span>Post</span>
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
