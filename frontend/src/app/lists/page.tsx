"use client";

import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/components/AuthProvider";
import { List } from "lucide-react";

export default function ListsPage() {
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
    <AppLayout title="Lists">
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-6">
          <List size={32} className="text-text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Your Lists</h2>
        <p className="text-text-muted max-w-sm leading-relaxed">
          Create and manage lists to organize the people you follow. This feature is coming soon.
        </p>
      </div>
    </AppLayout>
  );
}
