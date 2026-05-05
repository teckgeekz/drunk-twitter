"use client";

import { Home, Search, Bell, User, PenSquare, Hash } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { ComposeModal } from "./ComposeModal";
import { SignInModal } from "./SignInModal";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";

export function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [showCompose, setShowCompose] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/notifications/count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifCount(data.count);
        }
      } catch { /* silent */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const navItems = [
    { icon: <Home size={24} />, href: "/", label: "Home" },
    { icon: <Search size={24} />, href: "/explore", label: "Explore" },
    { icon: <Hash size={24} />, href: "/feeds", label: "Feeds" },
    { icon: <Bell size={24} />, href: "/notifications", label: "Notifications", badge: notifCount, requiresAuth: true },
    { icon: <User size={24} />, href: "/profile", label: "Profile", requiresAuth: true },
  ];

  const visibleItems = navItems.filter(item => !item.requiresAuth || user);

  return (
    <>
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 px-4 py-2 flex justify-around items-center h-16">
        {visibleItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link key={i} href={item.href} className="relative p-2">
              <div className={isActive ? "text-primary" : "text-text-muted"}>
                {item.icon}
                {item.badge && item.badge > 0 ? (
                  <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
        
        {/* Floating Action Button for Mobile Posting */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => user ? setShowCompose(true) : setShowSignIn(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 z-50 border border-white/10"
        >
          <PenSquare size={24} />
        </motion.button>
      </nav>

      <ComposeModal isOpen={showCompose} onClose={() => setShowCompose(false)} />
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  );
}
