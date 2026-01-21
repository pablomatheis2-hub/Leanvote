"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import type { PostWithDetails } from "@/types/database";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  post: PostWithDetails;
}

const categoryStyles: Record<string, string> = {
  Feature: "bg-blue-50 text-blue-700 border-blue-200",
  Bug: "bg-red-50 text-red-700 border-red-200",
  Integration: "bg-purple-50 text-purple-700 border-purple-200",
};

export function KanbanCard({ post }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    data: { post },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-white rounded-lg border border-zinc-200 p-4 cursor-grab active:cursor-grabbing",
        "hover:border-zinc-300 hover:shadow-sm transition-all",
        isDragging && "opacity-50 shadow-lg border-zinc-400 rotate-2"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
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
  );
}
