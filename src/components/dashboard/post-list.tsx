"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, Trash2, MoreHorizontal, ExternalLink, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePostStatus } from "@/lib/actions/admin";
import { deletePost } from "@/lib/actions/posts";
import type { PostWithDetails, Status, Category } from "@/types/database";

interface DashboardPostListProps {
  posts: PostWithDetails[];
  boardSlug: string;
}

const statusStyles: Record<Status, string> = {
  Open: "bg-zinc-100 text-zinc-700 border-zinc-200",
  Planned: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const categoryStyles: Record<Category, string> = {
  Feature: "bg-purple-50 text-purple-700 border-purple-200",
  Bug: "bg-red-50 text-red-700 border-red-200",
  Integration: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export function DashboardPostList({ posts, boardSlug }: DashboardPostListProps) {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPosts = filter === "all" 
    ? posts 
    : posts.filter(p => p.status === filter);

  const handleStatusChange = async (postId: string, newStatus: Status) => {
    setUpdatingId(postId);
    await updatePostStatus(postId, newStatus);
    setUpdatingId(null);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeletingId(postId);
    await deletePost(postId);
    setDeletingId(null);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-zinc-500">Filter:</span>
        {["all", "Open", "Planned", "In Progress", "Complete"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as Status | "all")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === status
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {status === "all" ? "All" : status}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-500">No posts found</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`p-4 flex items-start gap-4 ${deletingId === post.id ? "opacity-50" : ""}`}
            >
              {/* Vote count */}
              <div className="flex flex-col items-center min-w-[48px]">
                <ChevronUp className="w-5 h-5 text-zinc-400" />
                <span className="text-lg font-semibold text-zinc-900">{post.vote_count}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link 
                      href={`/b/${boardSlug}/post/${post.id}`}
                      className="font-medium text-zinc-900 hover:text-[#f97352] transition-colors"
                    >
                      {post.title}
                    </Link>
                    {post.description && (
                      <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{post.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-xs ${categoryStyles[post.category]}`}>
                        {post.category}
                      </Badge>
                      <span className="text-xs text-zinc-400">
                        by {post.author_name || "Anonymous"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status selector */}
                    <Select
                      value={post.status}
                      onValueChange={(value) => handleStatusChange(post.id, value as Status)}
                      disabled={updatingId === post.id}
                    >
                      <SelectTrigger className={`w-[130px] h-8 text-xs ${statusStyles[post.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Planned">Planned</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href={`/b/${boardSlug}/post/${post.id}`}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            View & Comment
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href={`/b/${boardSlug}/post/${post.id}`} target="_blank">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in New Tab
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
