"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, Plus } from "lucide-react";
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
import type { PostWithDetails, Status, Category } from "@/types/database";

interface PublicPostListProps {
  posts: PostWithDetails[];
  userVotes: Set<string>;
  isLoggedIn: boolean;
  boardOwnerId: string;
  slug: string;
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

export function PublicPostList({ posts, userVotes, isLoggedIn, boardOwnerId, slug }: PublicPostListProps) {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [votingId, setVotingId] = useState<string | null>(null);
  const [localVotes, setLocalVotes] = useState(userVotes);
  const [localVoteCounts, setLocalVoteCounts] = useState<Record<string, number>>(
    Object.fromEntries(posts.map(p => [p.id, p.vote_count]))
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredPosts = filter === "all" 
    ? posts 
    : posts.filter(p => p.status === filter);

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
    const result = await submitFeedback(boardOwnerId, formData);

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
      {/* Header with filter and submit button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
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

        {isLoggedIn ? (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#f97352] hover:bg-[#e8634a] text-white gap-2">
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
                  <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1.5">
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
                  <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1.5">
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
                  <label htmlFor="category" className="block text-sm font-medium text-zinc-700 mb-1.5">
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
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-[#f97352] hover:bg-[#e8634a] text-white"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Link href={`/auth/login?redirect=/b/${slug}`}>
            <Button className="bg-[#f97352] hover:bg-[#e8634a] text-white gap-2">
              <Plus className="w-4 h-4" />
              Sign in to Submit
            </Button>
          </Link>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-1">No feedback yet</h3>
            <p className="text-zinc-500 text-sm">
              Be the first to share your ideas!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isVoted = localVotes.has(post.id);
            const voteCount = localVoteCounts[post.id] ?? post.vote_count;
            
            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-zinc-200 p-4 flex items-start gap-4 hover:border-zinc-300 transition-colors"
              >
                {/* Vote button */}
                <button
                  onClick={() => handleVote(post.id)}
                  disabled={votingId === post.id}
                  className={cn(
                    "flex flex-col items-center min-w-[56px] py-2 px-3 rounded-lg border transition-all",
                    isVoted 
                      ? "bg-[#fff5f2] border-[#f97352] text-[#f97352]" 
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100"
                  )}
                >
                  <ChevronUp className={cn("w-5 h-5", isVoted && "text-[#f97352]")} />
                  <span className="text-lg font-semibold">{voteCount}</span>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-zinc-900">{post.title}</h3>
                      {post.description && (
                        <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{post.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${categoryStyles[post.category]}`}>
                          {post.category}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${statusStyles[post.status]}`}>
                          {post.status}
                        </Badge>
                      </div>
                    </div>
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
