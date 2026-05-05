"use client";

import { Sidebar } from "./Sidebar";

export function AppLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="max-w-7xl mx-auto flex justify-center min-h-screen bg-background">
      <Sidebar />
      <main className="w-full sm:w-[600px] flex-shrink-0 border-x border-white/5 min-h-screen pb-20 sm:pb-0 relative">
        <div className="sticky top-0 z-10 glass px-4 py-3 border-b border-white/5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
