"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export interface Post {
  id: string;
  userId: string;
  authorName?: string;
  authorHandle?: string;
  content: string;
  createdAt: string;
  replyToId?: string;
  replyToHandle?: string;
}

export function PostItem({ post, isSuperAdmin, currentUserId, onDelete, onReply }: { 
  post: Post; 
  isSuperAdmin?: boolean;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
  onReply?: (post: Post) => void;
}) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const displayName = post.authorName || `User ${post.userId.substring(0, 6)}...`;
  const avatarLetter = displayName[0].toUpperCase();

  const postDate = new Date(post.createdAt);
  const hour = postDate.getHours();
  const isCertifiedDrunk = hour >= 1 && hour < 5;

  const canDelete = isSuperAdmin || currentUserId === post.userId;

  const renderContent = (text: string) => {
    const parts = text.split(/(@[a-z0-9_]{3,30})/gi);
    return parts.map((part, i) => {
      if (part.match(/^@[a-z0-9_]{3,30}$/i)) {
        return <span key={i} className="text-primary font-medium">{part}</span>;
      }
      return part;
    });
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    
    setDeleting(true);
    onDelete?.(post.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="p-4 border-b border-white/5 hover:bg-surface/30 transition-colors group"
    >
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-hover flex-shrink-0 flex items-center justify-center font-bold text-text-muted">
          {avatarLetter}
        </div>
        <div className="flex-1 min-w-0">
          {post.replyToHandle && (
            <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
              <span>Replying to</span>
              <span className="text-primary">@{post.replyToHandle}</span>
            </div>
          )}
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="font-bold text-white truncate flex items-center gap-1">
              {displayName}
              {isCertifiedDrunk && <span title="Certified Drunk (Posted 1AM - 5AM)" className="text-sm">🍻</span>}
            </span>
            {post.authorHandle && (
              <span className="text-sm text-text-muted truncate">@{post.authorHandle}</span>
            )}
            <span className="text-sm text-text-muted flex-shrink-0">· {timeAgo}</span>
            
            {canDelete && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                disabled={deleting}
                className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  confirmDelete 
                    ? "bg-red-500/20 text-red-400 opacity-100" 
                    : "text-text-muted hover:text-red-400 hover:bg-red-500/10"
                } disabled:opacity-50`}
              >
                <Trash2 size={12} />
                <span>{deleting ? "..." : confirmDelete ? "Confirm?" : "Delete"}</span>
              </motion.button>
            )}
          </div>
          <div className="text-white text-base leading-relaxed break-words whitespace-pre-wrap">
            {renderContent(post.content)}
          </div>
          
          {onReply && currentUserId && (
            <div className="mt-3 flex items-center">
              <button 
                onClick={() => onReply(post)}
                className="text-text-muted hover:text-primary transition-colors text-sm font-medium flex items-center gap-1"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
