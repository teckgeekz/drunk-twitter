"use client";

import { Header } from "@/components/Header";
import { AppLayout } from "@/components/AppLayout";
import { Feed } from "@/components/Feed";
import { Landing } from "@/components/Landing";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { user, loading } = useAuth();

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

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <Header />
        <Landing />
      </main>
    );
  }

  return (
    <AppLayout title="Home">
      <Feed />
    </AppLayout>
  );
}
