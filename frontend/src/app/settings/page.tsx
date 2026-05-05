"use client";

import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/components/AuthProvider";
import { auth, signOut } from "@/lib/firebase";
import { motion } from "framer-motion";
import { LogOut, Moon, Globe, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <div className="w-3 h-3 rounded-full bg-primary/80"></div>
          <div className="w-3 h-3 rounded-full bg-primary/60"></div>
        </div>
      </div>
    );
  }

  const settingsGroups = [
    {
      title: "Appearance",
      items: [
        {
          icon: <Moon size={20} />,
          label: "Dark Mode",
          description: "Always on — it's the only way.",
          trailing: <span className="text-sm text-primary font-medium">On</span>,
        },
      ],
    },
    {
      title: "Feed",
      items: [
        {
          icon: <Globe size={20} />,
          label: "Feed Order",
          description: "Chronological, no algorithm. The way it should be.",
          trailing: <span className="text-sm text-primary font-medium">Latest</span>,
        },
      ],
    },
    {
      title: "Privacy",
      items: [
        {
          icon: <Shield size={20} />,
          label: "Rate Limit",
          description: "5 posts per minute to keep things fair.",
          trailing: <span className="text-sm text-text-muted font-medium">Enforced</span>,
        },
      ],
    },
  ];

  return (
    <AppLayout title="Settings">
      <div className="divide-y divide-white/5">
        {settingsGroups.map((group, gi) => (
          <div key={gi} className="py-2">
            <div className="px-4 py-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">{group.title}</h3>
            </div>
            {group.items.map((item, ii) => (
              <div
                key={ii}
                className="flex items-center gap-4 px-4 py-4 hover:bg-surface/30 transition-colors cursor-default"
              >
                <div className="text-text-muted">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">{item.label}</div>
                  <div className="text-sm text-text-muted">{item.description}</div>
                </div>
                {item.trailing}
              </div>
            ))}
          </div>
        ))}

        {user && (
          <div className="py-4 px-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </motion.button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
