"use client";

import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/components/AuthProvider";
import { PostItem, Post } from "@/components/PostItem";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { Pencil, Check, X, AlertCircle, Loader2 } from "lucide-react";

interface UserProfile {
  userId: string;
  displayName: string;
  handle: string;
  handleEdited: boolean;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);
  const handleCheckTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditName(data.displayName);
          setEditHandle(data.handle);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [user]);

  // Fetch posts
  const fetchMyPosts = async (cursor: string | null = null, isInitial = false) => {
    if (!user) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const url = new URL(`${apiUrl}/api/feed`);
      if (cursor) url.searchParams.append("cursor", cursor);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      const myPosts = data.posts.filter((p: Post) => p.userId === user.uid);

      if (isInitial) {
        setPosts(myPosts);
      } else {
        setPosts(prev => [...prev, ...myPosts]);
      }

      setNextCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyPosts(null, true);
  }, [user]);

  const lastPostRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLoadingMore(true);
        fetchMyPosts(nextCursor, false);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, nextCursor]);

  // Check handle availability (debounced)
  const checkHandle = (value: string) => {
    setEditHandle(value);
    setHandleAvailable(null);
    setEditError("");

    if (handleCheckTimer.current) clearTimeout(handleCheckTimer.current);

    const clean = value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean.length < 3) {
      setHandleAvailable(null);
      return;
    }
    if (clean === profile?.handle) {
      setHandleAvailable(true);
      return;
    }

    setCheckingHandle(true);
    handleCheckTimer.current = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/handle/check?handle=${encodeURIComponent(clean)}`);
        const data = await res.json();
        setHandleAvailable(data.available);
      } catch {
        setHandleAvailable(null);
      } finally {
        setCheckingHandle(false);
      }
    }, 500);
  };

  // Save profile
  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    setEditError("");

    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: editName.trim(),
          handle: editHandle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setProfile(data);
      setIsEditing(false);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setSaving(false);
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

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "User";
  const handle = profile?.handle || "";
  const avatarLetter = displayName[0].toUpperCase();
  const canEdit = profile && !profile.handleEdited;

  return (
    <AppLayout title="Profile">
      {/* Profile Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center font-bold text-3xl text-primary">
              {avatarLetter}
            </div>
            <div>
              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={50}
                      className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-white text-lg font-bold w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">@</span>
                      <input
                        type="text"
                        value={editHandle}
                        onChange={(e) => checkHandle(e.target.value)}
                        maxLength={30}
                        className="bg-surface border border-white/10 rounded-lg pl-8 pr-10 py-2 text-white w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {checkingHandle && <Loader2 size={16} className="text-text-muted animate-spin" />}
                        {!checkingHandle && handleAvailable === true && <Check size={16} className="text-green-400" />}
                        {!checkingHandle && handleAvailable === false && <X size={16} className="text-red-400" />}
                      </div>
                    </div>
                    {!checkingHandle && handleAvailable === false && (
                      <p className="text-red-400 text-xs mt-1">This handle is taken</p>
                    )}
                  </div>

                  {editError && (
                    <div className="flex items-center gap-1.5 text-red-400 text-sm">
                      <AlertCircle size={14} />
                      <span>{editError}</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-1">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={saving || handleAvailable === false || editName.trim().length < 1}
                      className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-bold disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(profile?.displayName || "");
                        setEditHandle(profile?.handle || "");
                        setEditError("");
                      }}
                      className="px-4 py-1.5 rounded-full bg-surface-hover text-text-muted text-sm font-bold"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  <p className="text-text-muted">@{handle}</p>
                  <p className="text-sm text-text-muted mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
                </>
              )}
            </div>
          </div>

          {!isEditing && canEdit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-sm font-bold text-white hover:bg-surface-hover transition-colors"
            >
              <Pencil size={14} />
              <span>Edit Profile</span>
            </motion.button>
          )}

          {!isEditing && profile?.handleEdited && (
            <span className="text-xs text-text-muted bg-surface px-3 py-1 rounded-full">Profile locked</span>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-4 p-2">
                <div className="w-10 h-10 rounded-full bg-surface-hover"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-surface-hover rounded w-1/4"></div>
                  <div className="h-4 bg-surface-hover rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-text-muted">
            <p className="text-lg">No posts yet.</p>
            <p className="text-sm mt-2">Head home and share your first thought!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {posts.map((post, index) => {
              if (posts.length === index + 1) {
                return (
                  <div ref={lastPostRef} key={post.id}>
                    <PostItem post={post} />
                  </div>
                );
              }
              return <PostItem key={post.id} post={post} />;
            })}
          </AnimatePresence>
        )}

        {loadingMore && (
          <div className="p-4 text-center text-text-muted animate-pulse">Loading more...</div>
        )}
      </div>
    </AppLayout>
  );
}
