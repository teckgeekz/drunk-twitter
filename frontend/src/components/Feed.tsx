"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PostBox } from "./PostBox";
import { PostItem, Post } from "./PostItem";
import { ComposeModal } from "./ComposeModal";
import { useAuth } from "./AuthProvider";
import { AnimatePresence } from "framer-motion";
import { getApiUrl } from "@/lib/api";

export function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [replyPost, setReplyPost] = useState<Post | null>(null);
  
  const observer = useRef<IntersectionObserver | null>(null);

  // Check super admin status
  useEffect(() => {
    if (!user) {
      setIsSuperAdmin(false);
      return;
    }
    const checkAdmin = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsSuperAdmin(data.isSuperAdmin || false);
        }
      } catch {
        // silent
      }
    };
    checkAdmin();
  }, [user]);

  const fetchPosts = async (cursor: string | null = null, isInitial = false) => {
    try {
      const apiUrl = getApiUrl();
      const url = new URL(`${apiUrl}/api/feed`);
      if (cursor) {
        url.searchParams.append("cursor", cursor);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch posts");
      
      const data = await res.json();
      
      if (isInitial) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      
      setNextCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load & Polling for new posts
  useEffect(() => {
    fetchPosts(null, true);
    
    const interval = setInterval(() => {
      fetchLatestPosts();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchLatestPosts = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/feed`);
      if (!res.ok) return;
      const data = await res.json();
      
      setPosts(prevPosts => {
        if (prevPosts.length === 0) return data.posts;
        
        const existingIds = new Set(prevPosts.map((p: Post) => p.id));
        const newPosts = data.posts.filter((p: Post) => !existingIds.has(p.id));
        
        if (newPosts.length > 0) {
          return [...newPosts, ...prevPosts];
        }
        return prevPosts;
      });
    } catch (err) {
      // Silent fail for polling
    }
  };

  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLoadingMore(true);
        fetchPosts(nextCursor, false);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, nextCursor]);

  const handlePostSuccess = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="w-full min-h-screen relative pb-20">
      <PostBox onPostSuccess={handlePostSuccess} />
      
      <div className="flex flex-col">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-4 p-2">
                <div className="w-10 h-10 rounded-full bg-surface-hover"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-surface-hover rounded w-1/4"></div>
                  <div className="h-4 bg-surface-hover rounded w-3/4"></div>
                  <div className="h-4 bg-surface-hover rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {posts.map((post, index) => {
              const currentUserId = user?.uid;
              if (posts.length === index + 1) {
                return (
                  <div ref={lastPostElementRef} key={post.id}>
                    <PostItem post={post} isSuperAdmin={isSuperAdmin} currentUserId={currentUserId} onDelete={handleDelete} onReply={setReplyPost} />
                  </div>
                );
              }
              return <PostItem key={post.id} post={post} isSuperAdmin={isSuperAdmin} currentUserId={currentUserId} onDelete={handleDelete} onReply={setReplyPost} />;
            })}
          </AnimatePresence>
        )}
        
        {replyPost && (
          <ComposeModal 
            isOpen={!!replyPost} 
            onClose={() => setReplyPost(null)} 
            onPostSuccess={handlePostSuccess}
            replyTo={replyPost}
          />
        )}
        
        {loadingMore && (
          <div className="p-4 text-center text-text-muted animate-pulse">
            Loading more...
          </div>
        )}
        
        {!hasMore && posts.length > 0 && (
          <div className="p-8 text-center text-text-muted">
            You've reached the end of the feed.
          </div>
        )}
      </div>
    </div>
  );
}
