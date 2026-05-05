"use client";

import { AppLayout } from "@/components/AppLayout";
import { Feed } from "@/components/Feed";
import { useAuth } from "@/components/AuthProvider";

export default function FeedsPage() {
  const { loading } = useAuth();

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

  return (
    <AppLayout title="Feeds">
      <div className="px-4 py-3 border-b border-white/5">
        <p className="text-text-muted text-sm">Global feed — latest posts, no algorithm, pure chronological order.</p>
      </div>
      <Feed />
    </AppLayout>
  );
}
