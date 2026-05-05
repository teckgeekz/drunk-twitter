"use client";

import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AtSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  fromUserName: string;
  fromUserHandle: string;
  postId: string;
  postContent: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();

    // Mark all as read after viewing
    const markRead = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        await fetch(`${apiUrl}/api/notifications/read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch { /* silent */ }
    };
    // Delay marking as read so the user can see unread indicators
    const timer = setTimeout(markRead, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  if (authLoading) {
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

  return (
    <AppLayout title="Notifications">
      {loading ? (
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-surface-hover"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-surface-hover rounded w-3/4"></div>
                <div className="h-3 bg-surface-hover rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-6">
            <Bell size={32} className="text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No notifications yet</h2>
          <p className="text-text-muted max-w-sm leading-relaxed">
            When someone mentions you with <span className="text-primary">@yourhandle</span> in a post, it will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-white/5">
          <AnimatePresence initial={false}>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 hover:bg-surface/30 transition-colors ${!notif.read ? "border-l-2 border-l-primary bg-primary/5" : ""}`}
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <AtSign size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-white">{notif.fromUserName}</span>
                      <span className="text-sm text-text-muted">@{notif.fromUserHandle}</span>
                      <span className="text-sm text-text-muted">· {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-text-muted text-sm mb-2">mentioned you in a post</p>
                    <div className="bg-surface/50 rounded-xl p-3 border border-white/5">
                      <p className="text-white text-sm break-words whitespace-pre-wrap">{notif.postContent}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </AppLayout>
  );
}
