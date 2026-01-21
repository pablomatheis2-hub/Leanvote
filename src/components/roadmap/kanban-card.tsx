"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { deletePost } from "@/lib/actions/posts";
import type { PostWithDetails } from "@/types/database";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  post: PostWithDetails;
  onDelete?: (postId: string) => void;
}

const categoryStyles: Record<string, string> = {
  Feature: "bg-blue-50 text-blue-700 border-blue-200",
  Bug: "bg-red-50 text-red-700 border-red-200",
  Integration: "bg-purple-50 text-purple-700 border-purple-200",
};

export function KanbanCard({ post, onDelete }: KanbanCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    data: { post },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const result = await deletePost(post.id);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      onDelete?.(post.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-lg border border-zinc-200 p-4 group relative",
        "hover:border-zinc-300 hover:shadow-sm transition-all",
        isDragging && "opacity-50 shadow-lg border-zinc-400 rotate-2",
        isDeleting && "opacity-50 pointer-events-none"
      )}
    >
      {/* Delete button - appears on hover */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all z-10"
        title="Delete post"
      >
        {isDeleting ? (
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Draggable area */}
      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <div className="flex items-start justify-between gap-2 mb-2 pr-6">
          <h4 className="font-medium text-zinc-900 text-sm leading-snug line-clamp-2">
            {post.title}
          </h4>
          <Badge
            variant="outline"
            className={cn("text-[10px] font-medium border flex-shrink-0", categoryStyles[post.category])}
          >
            {post.category}
          </Badge>
        </div>
        {post.description && (
          <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
            {post.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            {post.vote_count}
          </span>
          <span>{post.author_name || "Anonymous"}</span>
        </div>
      </div>
    </div>
  );
}
