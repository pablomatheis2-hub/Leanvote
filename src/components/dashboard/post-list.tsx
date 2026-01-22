"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, Trash2, MoreHorizontal, ExternalLink, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { promoteToRoadmap } from "@/lib/actions/admin";
import { deletePost } from "@/lib/actions/posts";
import type { PostWithDetails, Status, Category } from "@/types/database";

interface DashboardPostListProps {
  posts: PostWithDetails[];
  boardSlug: string;
}

const categoryStyles: Record<Category, string> = {
  Feature: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  Bug: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
  Integration: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800",
};

const statusConfig: Record<Exclude<Status, "Open">, { label: string; color: string; dot: string }> = {
  Planned: { label: "Planned", color: "text-blue-700", dot: "bg-blue-500" },
  "In Progress": { label: "In Progress", color: "text-amber-700", dot: "bg-amber-500" },
  Complete: { label: "Complete", color: "text-emerald-700", dot: "bg-emerald-500" },
};

export function DashboardPostList({ posts, boardSlug }: DashboardPostListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Exclude<Status, "Open">>("Planned");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [promoteError, setPromoteError] = useState<string | null>(null);

  const openPromoteDialog = (post: PostWithDetails, status: Exclude<Status, "Open">) => {
    setSelectedPost(post);
    setSelectedStatus(status);
    setEditedTitle(post.title);
    setEditedDescription(post.description || "");
    setPromoteError(null);
    setPromoteDialogOpen(true);
  };

  const handlePromote = async () => {
    if (!selectedPost) return;
    
    setUpdatingId(selectedPost.id);
    const result = await promoteToRoadmap(
      selectedPost.id,
      selectedStatus,
      editedTitle,
      editedDescription || null
    );
    
    if (result.error) {
      setPromoteError(result.error);
      setUpdatingId(null);
    } else {
      setPromoteDialogOpen(false);
      setSelectedPost(null);
      setUpdatingId(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeletingId(postId);
    await deletePost(postId);
    setDeletingId(null);
  };

  return (
    <div>
      {/* Helpful tip banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Turn feedback into roadmap items
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
              Click &quot;Add to Roadmap&quot; on any feedback to move it to your public roadmap. 
              You can edit the title and description to clarify what you&apos;re building.
            </p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No feedback yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Share your board link with users to start collecting feedback. 
              When they submit ideas, they&apos;ll appear here for you to review.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={`p-4 flex items-start gap-4 ${deletingId === post.id || updatingId === post.id ? "opacity-50" : ""}`}
            >
              {/* Vote count */}
              <div className="flex flex-col items-center min-w-[48px]">
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">{post.vote_count}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link 
                      href={`/b/${boardSlug}/post/${post.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                    {post.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-xs ${categoryStyles[post.category]}`}>
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        by {post.author_name || "Anonymous"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Add to roadmap dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90"
                          disabled={updatingId === post.id}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Add to Roadmap
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          Choose a status:
                        </div>
                        {(["Planned", "In Progress", "Complete"] as const).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => openPromoteDialog(post, status)}
                            className="cursor-pointer"
                          >
                            <span className={`w-2 h-2 rounded-full ${statusConfig[status].dot} mr-2`} />
                            {statusConfig[status].label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

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

      {/* Promote to Roadmap Dialog */}
      <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Add to Roadmap
            </DialogTitle>
            <DialogDescription>
              Move this feedback to your public roadmap. You can customize how it appears.
            </DialogDescription>
          </DialogHeader>

          {selectedPost && (
            <div className="space-y-5 mt-2">
              {/* Original feedback reference */}
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Original feedback from {selectedPost.author_name || "Anonymous"}:</p>
                <p className="text-sm text-foreground">&quot;{selectedPost.title}&quot;</p>
                {selectedPost.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedPost.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={`text-xs ${categoryStyles[selectedPost.category]}`}>
                    {selectedPost.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedPost.vote_count} vote{selectedPost.vote_count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Status selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <div className="flex gap-2">
                  {(["Planned", "In Progress", "Complete"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                        selectedStatus === status
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusConfig[status].dot}`} />
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable title */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Title for Roadmap
                </label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="How it will appear on your roadmap"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Rephrase to describe what you&apos;re building, e.g. &quot;Dark mode&quot; → &quot;Dark theme with system preference detection&quot;
                </p>
              </div>

              {/* Editable description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description (optional)
                </label>
                <Textarea
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Additional details about the implementation..."
                  rows={3}
                />
              </div>

              {promoteError && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-3 py-2 rounded-lg">
                  {promoteError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPromoteDialogOpen(false)}
                  disabled={updatingId === selectedPost.id}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePromote}
                  disabled={updatingId === selectedPost.id || !editedTitle.trim()}
                  className="bg-primary hover:bg-primary/90 gap-1.5"
                >
                  {updatingId === selectedPost.id ? (
                    "Moving..."
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Add to Roadmap
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
