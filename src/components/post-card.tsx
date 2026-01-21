"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "./vote-button";
import type { PostWithDetails, Status } from "@/types/database";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: PostWithDetails;
  hasVoted: boolean;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

const categoryStyles: Record<string, string> = {
  Feature: "bg-blue-50 text-blue-700 border-blue-200",
  Bug: "bg-red-50 text-red-700 border-red-200",
  Integration: "bg-purple-50 text-purple-700 border-purple-200",
};

const statusStyles: Record<Status, { bg: string; dot: string }> = {
  Open: { bg: "bg-zinc-100 text-zinc-700", dot: "bg-zinc-400" },
  Planned: { bg: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  "In Progress": { bg: "bg-blue-50 text-blue-700", dot: "bg-blue-400" },
  Complete: { bg: "bg-green-50 text-green-700", dot: "bg-green-400" },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? "Just now" : `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PostCard({ post, hasVoted, isLoggedIn, onLoginRequired }: PostCardProps) {
  const initials = post.author_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  const status = statusStyles[post.status];

  return (
    <div className="flex gap-4 p-5 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors">
      <VoteButton
        postId={post.id}
        initialVoteCount={post.vote_count}
        initialHasVoted={hasVoted}
        isLoggedIn={isLoggedIn}
        onLoginRequired={onLoginRequired}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <Link href={`/post/${post.id}`} className="hover:underline underline-offset-2">
            <h3 className="font-medium text-zinc-900 leading-snug">{post.title}</h3>
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant="outline"
              className={cn("text-xs font-medium border", categoryStyles[post.category])}
            >
              {post.category}
            </Badge>
            <Badge
              variant="secondary"
              className={cn("text-xs font-medium flex items-center gap-1.5", status.bg)}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {post.status}
            </Badge>
          </div>
        </div>
        {post.description && (
          <p className="mt-2 text-sm text-zinc-500 line-clamp-2 leading-relaxed">
            {post.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
          <Avatar className="h-5 w-5">
            <AvatarImage src={post.author_avatar || undefined} />
            <AvatarFallback className="text-[10px] bg-zinc-100">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-zinc-500">{post.author_name || "Anonymous"}</span>
          <span>-</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
