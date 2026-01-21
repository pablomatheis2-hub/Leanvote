"use client";

import { useState } from "react";
import { MessageCircle, Send, Trash2, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment, deleteComment } from "@/lib/actions/comments";
import { cn } from "@/lib/utils";
import type { CommentWithAuthor } from "@/types/database";

interface CommentsProps {
  postId: string;
  initialComments: CommentWithAuthor[];
  isLoggedIn: boolean;
  currentUserId: string | null;
  isBoardOwner: boolean;
  slug: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Comments({
  postId,
  initialComments,
  isLoggedIn,
  currentUserId,
  isBoardOwner,
  slug,
}: CommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const result = await addComment(postId, newComment);

    if (result.error) {
      setError(result.error);
    } else if (result.comment) {
      setComments((prev) => [...prev, result.comment!]);
      setNewComment("");
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);

    const result = await deleteComment(commentId);

    if (result.error) {
      setError(result.error);
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }

    setDeletingId(null);
  };

  const canDelete = (comment: CommentWithAuthor) => {
    return comment.user_id === currentUserId || isBoardOwner;
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment list */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => {
            const initials = comment.author_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "?";

            return (
              <div
                key={comment.id}
                className={cn(
                  "flex gap-3 p-4 rounded-xl",
                  comment.is_board_owner
                    ? "bg-[#fff5f2] border border-[#f97352]/20"
                    : "bg-zinc-50"
                )}
              >
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage src={comment.author_avatar || undefined} />
                  <AvatarFallback
                    className={cn(
                      "text-xs font-medium",
                      comment.is_board_owner
                        ? "bg-[#f97352] text-white"
                        : "bg-zinc-200 text-zinc-600"
                    )}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-zinc-900">
                      {comment.author_name || "Anonymous"}
                    </span>
                    {comment.is_board_owner && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f97352] text-white text-[10px] font-semibold rounded-full uppercase tracking-wide">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>

                {canDelete(comment) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                    title="Delete comment"
                  >
                    {deletingId === comment.id ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add comment form */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              setError(null);
            }}
            placeholder="Add a comment..."
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-[#f97352] hover:bg-[#e8634a] text-white gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-50 rounded-xl p-6 text-center">
          <p className="text-sm text-zinc-500 mb-3">
            Sign in to join the conversation
          </p>
          <a
            href={`/auth/login?redirect=/b/${slug}/post/${postId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#f97352] hover:bg-[#e8634a] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Sign in to comment
          </a>
        </div>
      )}
    </div>
  );
}
