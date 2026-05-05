"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Type, FastForward, LogIn, Beer, Ghost, AtSign } from "lucide-react";
import { SignInModal } from "./SignInModal";
import { useState, useEffect } from "react";

const FloatingPost = ({ text, handle, delay, top, left, rotation }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 50, rotate: rotation - 10 }}
    animate={{ 
      opacity: [0, 0.4, 0.4, 0],
      y: [-50, -150],
      x: [0, Math.random() * 50 - 25],
      rotate: [rotation, rotation + (Math.random() * 20 - 10)]
    }}
    transition={{ 
      duration: 8, 
      delay, 
      repeat: Infinity,
      ease: "linear"
    }}
    className="absolute pointer-events-none glass p-4 rounded-2xl max-w-xs border border-white/10 hidden md:block z-0"
    style={{ top, left }}
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 rounded-full bg-primary/40 flex items-center justify-center text-[10px] font-bold">
        {handle[1].toUpperCase()}
      </div>
      <span className="text-xs text-text-muted">{handle}</span>
    </div>
    <p className="text-sm text-white/80">{text}</p>
  </motion.div>
);

export function Landing() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Beer className="w-8 h-8 text-primary" />,
      title: "Raw & Unfiltered",
      description: "No algos deciding what you see. Just a straight pipe of human consciousness, chronologically sorted. Drink it in."
    },
    {
      icon: <Ghost className="w-8 h-8 text-primary" />,
      title: "Embrace the Anon",
      description: "Generate a ridiculous name like 'NeonPanda99' instantly. Post your spicy takes without the baggage of your real identity."
    },
    {
      icon: <Type className="w-8 h-8 text-primary" />,
      title: "Text Only, No Distractions",
      description: "We stripped away images, videos, likes, and comments. 650 characters of pure text. Make them count."
    },
    {
      icon: <AtSign className="w-8 h-8 text-primary" />,
      title: "Mention the Chaos",
      description: "Tag your fellow degenerates with @handles. They'll get notified. Drama ensues."
    }
  ];

  const floatingPosts = [
    { text: "why do hotdogs come in packs of 10 but buns in 8? the simulation is broken.", handle: "@cosmicwolf44", delay: 0, top: "15%", left: "5%", rotation: -12 },
    { text: "I just spent 40 minutes arguing with a wall. The wall won.", handle: "@neonpanda99", delay: 2, top: "60%", left: "10%", rotation: 8 },
    { text: "sleep is just a time machine to breakfast", handle: "@chillcomet12", delay: 4, top: "25%", left: "75%", rotation: 15 },
    { text: "if tomatoes are fruits, is ketchup a smoothie? asking for a friend.", handle: "@savagehawk", delay: 1, top: "70%", left: "80%", rotation: -5 },
    { text: "just deployed to prod on a friday at 5pm. wish me luck.", handle: "@wildbyte", delay: 5, top: "40%", left: "85%", rotation: 20 },
  ];

  return (
    <>
      <div className="relative flex-1 flex flex-col items-center max-w-6xl mx-auto px-4 py-16 sm:py-24 overflow-hidden min-h-screen">
        
        {/* Background ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating Posts */}
        {floatingPosts.map((post, i) => (
          <FloatingPost key={i} {...post} />
        ))}

        <motion.div 
          animate={{ x: mousePosition.x, y: mousePosition.y }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="text-center max-w-4xl mb-24 relative z-10 mt-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-bold text-sm tracking-wider uppercase backdrop-blur-md"
          >
            Welcome to the Afterparty
          </motion.div>

          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white mb-6 leading-none">
            Drunk <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-500 animate-gradient-x">
              Twitter.
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-text-muted mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            The microblogging platform where your inner voice gets a megaphone. No algorithms. No likes. Just raw thoughts.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSignIn(true)}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black hover:bg-gray-100 text-xl font-black transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            <Beer size={24} />
            <span>Grab a Mic</span>
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl relative z-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass p-8 rounded-3xl border border-white/5 hover:border-primary/50 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] group-hover:bg-primary/20 transition-colors" />
              
              <div className="w-16 h-16 rounded-2xl bg-surface border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg relative z-10">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black text-white mb-3 relative z-10">{feature.title}</h3>
              <p className="text-text-muted text-lg leading-relaxed relative z-10">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer / Credits */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 text-center relative z-10 pb-10"
        >
          <p className="text-text-muted text-sm font-medium">
            Engineered for chaos by <a href="https://teckgeekz.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white transition-colors font-bold border-b border-primary/30 hover:border-white">TeckGeekz</a>
          </p>
        </motion.div>
      </div>

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  );
}
