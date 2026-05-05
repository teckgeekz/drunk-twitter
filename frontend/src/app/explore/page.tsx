"use client";

import { AppLayout } from "@/components/AppLayout";
import { Feed } from "@/components/Feed";
import { PostItem, Post } from "@/components/PostItem";
import { useAuth } from "@/components/AuthProvider";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Check admin status
  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsSuperAdmin(data.isSuperAdmin || false);
        }
      } catch { /* silent */ }
    };
    checkAdmin();
  }, [user]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.posts);
          setHasSearched(true);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleDelete = async (postId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSearchResults(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

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

  const isSearching = searchQuery.trim().length > 0;

  return (
    <AppLayout title="Explore">
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search posts, users, handles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface rounded-full py-3 pl-12 pr-4 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {isSearching ? (
        <div className="flex flex-col">
          {searching ? (
            <div className="p-8 text-center text-text-muted animate-pulse">
              Searching...
            </div>
          ) : hasSearched && searchResults.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              <p className="text-lg">No results found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {searchResults.map(post => (
                <PostItem key={post.id} post={post} isSuperAdmin={isSuperAdmin} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          )}
        </div>
      ) : (
        <Feed />
      )}
    </AppLayout>
  );
}
