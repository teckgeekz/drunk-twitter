"use client";

import { Home, Search, Bell, Hash, List, Bookmark, User, Settings, PenSquare, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { auth, signOut } from "@/lib/firebase";
import { SignInModal } from "./SignInModal";
import { ComposeModal } from "./ComposeModal";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";

interface UserProfile {
  displayName: string;
  handle: string;
}

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifCount, setNotifCount] = useState(0);

  // Fetch profile from backend when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setNotifCount(0);
      return;
    }
    const fetchProfile = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        // silent
      }
    };
    fetchProfile();
  }, [user]);

  // Poll notification count
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

  const menuItems = [
    { icon: <Home size={28} />, label: "Home", href: "/" },
    { icon: <Search size={28} />, label: "Explore", href: "/explore" },
    { icon: <Bell size={28} />, label: "Notifications", href: "/notifications", requiresAuth: true, badge: notifCount },
    { icon: <Hash size={28} />, label: "Feeds", href: "/feeds" },
    { icon: <List size={28} />, label: "Lists", href: "/lists", requiresAuth: true },
    { icon: <Bookmark size={28} />, label: "Saved", href: "/saved", requiresAuth: true },
    { icon: <User size={28} />, label: "Profile", href: "/profile", requiresAuth: true },
    { icon: <Settings size={28} />, label: "Settings", href: "/settings" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  const handlePostSuccess = () => {
    // Navigate to home so the post is visible
    if (pathname !== "/") {
      router.push("/");
    }
    // Slight delay to allow navigation
    setTimeout(() => window.location.reload(), 300);
  };

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || (user?.isAnonymous ? "Anonymous" : undefined);
  const handle = profile?.handle || "";
  const avatarLetter = displayName?.[0].toUpperCase() || "A";

  const visibleMenuItems = menuItems.filter(item => !item.requiresAuth || user);

  return (
    <>
      <header className="hidden sm:flex w-20 xl:w-72 flex-col justify-between sticky top-0 h-screen py-4 px-2 xl:px-6 border-r border-white/5 bg-background z-50">
        <div className="flex flex-col gap-1 xl:gap-2 items-center xl:items-start w-full">
          <Link href="/" className="flex items-center justify-center w-14 h-14 mb-2 xl:mb-4 rounded-full hover:bg-surface-hover transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              B
            </div>
          </Link>

          {visibleMenuItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link key={i} href={item.href} className="w-fit xl:w-full">
                <motion.div
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`relative flex items-center justify-center xl:justify-start gap-4 p-3 xl:py-3 xl:px-4 rounded-full cursor-pointer transition-colors w-fit xl:w-full ${isActive ? "font-bold text-white" : "text-text-main hover:text-white"}`}
                >
                  <div className="relative">
                    {item.icon}
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="hidden xl:inline text-xl">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => user ? setShowCompose(true) : setShowSignIn(true)}
            className="mt-4 w-14 h-14 xl:w-11/12 xl:h-auto xl:py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors font-bold text-lg"
          >
            <PenSquare size={24} className="xl:hidden" />
            <span className="hidden xl:inline">{user ? "New post" : "Sign In"}</span>
          </motion.button>
        </div>

        {user ? (
          <div 
            onClick={handleSignOut}
            className="mt-auto flex items-center justify-center xl:justify-start gap-3 p-3 xl:p-3 hover:bg-surface-hover rounded-full cursor-pointer transition-colors w-fit xl:w-full"
          >
            <div className="w-10 h-10 rounded-full bg-surface-hover flex-shrink-0 flex items-center justify-center font-bold text-text-muted">
              {avatarLetter}
            </div>
            <div className="hidden xl:block overflow-hidden flex-1">
              <div className="font-bold truncate text-white text-base">
                {displayName}
              </div>
              <div className="text-sm text-text-muted truncate">
                {handle ? `@${handle}` : (user.isAnonymous ? "Anonymous" : `@${user.email?.split('@')[0]}`)}
              </div>
            </div>
            <div className="hidden xl:block text-text-muted ml-auto">
              <LogOut size={18} />
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setShowSignIn(true)}
            className="mt-auto flex items-center justify-center xl:justify-start gap-3 p-3 xl:p-3 hover:bg-surface-hover rounded-full cursor-pointer transition-colors w-fit xl:w-full"
          >
            <div className="hidden xl:block overflow-hidden flex-1">
              <div className="font-bold text-white text-base text-center">
                Sign In
              </div>
            </div>
          </div>
        )}
      </header>

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
      <ComposeModal isOpen={showCompose} onClose={() => setShowCompose(false)} onPostSuccess={handlePostSuccess} />
    </>
  );
}
