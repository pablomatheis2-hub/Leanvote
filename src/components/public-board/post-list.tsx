"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, Plus, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toggleVote, submitFeedback } from "@/lib/actions/posts";
import { cn } from "@/lib/utils";
import type { PostWithDetails, Category, Status } from "@/types/database";

interface PublicPostListProps {
  posts: PostWithDetails[];
  userVotes: Set<string>;
  isLoggedIn: boolean;
  boardOwnerId: string;
  slug: string;
  projectId?: string;
}

const categoryStyles: Record<Category, string> = {
  Feature: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  Bug: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
  Integration: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800",
};

const statusConfig: Record<Exclude<Status, "Open">, { label: string; dot: string; badge: string }> = {
  Planned: { label: "Planned", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800" },
  "In Progress": { label: "In Progress", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800" },
  Complete: { label: "Complete", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800" },
};

export function PublicPostList({ posts, userVotes, isLoggedIn, boardOwnerId, slug, projectId }: PublicPostListProps) {
  const [votingId, setVotingId] = useState<string | null>(null);
  const [localVotes, setLocalVotes] = useState(userVotes);
  const [localVoteCounts, setLocalVoteCounts] = useState<Record<string, number>>(
    Object.fromEntries(posts.map(p => [p.id, p.vote_count]))
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (postId: string) => {
    if (!isLoggedIn) {
      window.location.href = `/auth/login?redirect=/b/${slug}`;
      return;
    }

    setVotingId(postId);
    const wasVoted = localVotes.has(postId);
    
    // Optimistic update
    setLocalVotes(prev => {
      const next = new Set(prev);
      if (wasVoted) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
    setLocalVoteCounts(prev => ({
      ...prev,
      [postId]: prev[postId] + (wasVoted ? -1 : 1)
    }));

    const result = await toggleVote(postId);
    
    if (result.error) {
      // Revert on error
      setLocalVotes(prev => {
        const next = new Set(prev);
        if (wasVoted) {
          next.add(postId);
        } else {
          next.delete(postId);
        }
        return next;
      });
      setLocalVoteCounts(prev => ({
        ...prev,
        [postId]: prev[postId] + (wasVoted ? 1 : -1)
      }));
    }
    
    setVotingId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitFeedback(boardOwnerId, formData, projectId);

    if (result.error) {
      setError(result.error);
    } else {
      setDialogOpen(false);
      (e.target as HTMLFormElement).reset();
    }
    setSubmitting(false);
  };

  return (
    <div>
      {/* Header with submit button */}
      <div className="flex items-center justify-end mb-6">
        {isLoggedIn ? (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
                <DialogDescription>
                  Share your idea, report a bug, or request a feature.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
                    Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Brief summary of your feedback"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                    Description (optional)
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide more details..."
                    rows={3}
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5">
                    Category
                  </label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Feature">Feature Request</SelectItem>
                      <SelectItem value="Bug">Bug Report</SelectItem>
                      <SelectItem value="Integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-3 py-2 rounded-lg">{error}</p>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Link href={`/auth/login?redirect=/b/${slug}`}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" />
              Sign in to Submit
            </Button>
          </Link>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No feedback yet</h3>
            <p className="text-muted-foreground text-sm">
              Be the first to share your ideas!
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const isVoted = localVotes.has(post.id);
            const voteCount = localVoteCounts[post.id] ?? post.vote_count;
            
            return (
              <div
                key={post.id}
                className="bg-card rounded-xl border border-border p-3 sm:p-4 flex items-start gap-3 sm:gap-4 hover:border-primary/30 transition-colors"
              >
                {/* Vote button */}
                <button
                  onClick={() => handleVote(post.id)}
                  disabled={votingId === post.id}
                  className={cn(
                    "flex flex-col items-center min-w-[48px] sm:min-w-[56px] py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg border transition-all shrink-0",
                    isVoted 
                      ? "bg-secondary border-primary text-primary" 
                      : "bg-muted border-border text-muted-foreground hover:border-border/80 hover:bg-muted/80"
                  )}
                >
                  <ChevronUp className={cn("w-4 h-4 sm:w-5 sm:h-5", isVoted && "text-primary")} />
                  <span className="text-base sm:text-lg font-semibold">{voteCount}</span>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/b/${slug}/post/${post.id}`}
                        className="font-medium text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {post.title}
                      </Link>
                      {post.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{post.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] sm:text-xs ${categoryStyles[post.category]}`}>
                          {post.category}
                        </Badge>
                        {/* Show status badge for posts on roadmap */}
                        {post.status !== "Open" && (
                          <Badge variant="outline" className={`text-[10px] sm:text-xs ${statusConfig[post.status].badge}`}>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${statusConfig[post.status].dot} mr-1 sm:mr-1.5`} />
                            {statusConfig[post.status].label}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Link 
                      href={`/b/${slug}/post/${post.id}`}
                      className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title="View comments"
                    >
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Comments</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
