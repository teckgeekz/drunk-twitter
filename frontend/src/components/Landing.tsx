"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Type, FastForward, LogIn } from "lucide-react";
import { SignInModal } from "./SignInModal";
import { useState } from "react";

export function Landing() {
  const [showSignIn, setShowSignIn] = useState(false);

  const features = [
    {
      icon: <Type className="w-6 h-6 text-primary" />,
      title: "Text-Only, Pure Thoughts",
      description: "No images, no videos, no distractions. Just your words up to 650 characters."
    },
    {
      icon: <FastForward className="w-6 h-6 text-primary" />,
      title: "Zero Clutter",
      description: "No comments, likes, or reposts. A true chronological stream of consciousness."
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Lightning Fast",
      description: "Powered by Redis and Node.js clustering for an instant, real-time feel."
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Fair Usage",
      description: "Rate limited to 5 posts per minute to prevent spam and encourage quality."
    }
  ];

  return (
    <>
      <div className="flex-1 flex flex-col items-center max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mb-20"
        >
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white mb-6">
            The Feed, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Stripped Bare.
            </span>
          </h1>
          <p className="text-xl text-text-muted mb-10 leading-relaxed">
            Welcome to BhangBosdha. A high-performance microblogging platform where your words take center stage. No algorithms, no vanity metrics. Just a global chronological feed of raw thoughts.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(139, 92, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSignIn(true)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-white text-lg font-bold transition-all"
          >
            <LogIn size={20} />
            <span>Join the Conversation</span>
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="glass p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-text-muted leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  );
}
