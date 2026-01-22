import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { KanbanBoard } from "@/components/roadmap/kanban-board";
import { MessageCircle, ArrowRight, Lightbulb } from "lucide-react";
import type { PostWithDetails } from "@/types/database";

export const revalidate = 0;

async function getRoadmapPosts(boardOwnerId: string): Promise<PostWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url
      ),
      votes (
        id
      )
    `)
    .eq("board_owner_id", boardOwnerId)
    .in("status", ["Planned", "In Progress", "Complete"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return (data || []).map((post) => ({
    ...post,
    author_name: post.profiles?.full_name || null,
    author_avatar: post.profiles?.avatar_url || null,
    vote_count: post.votes?.length || 0,
  }));
}

async function getPendingFeedbackCount(boardOwnerId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("board_owner_id", boardOwnerId)
    .eq("status", "Open");

  if (error) {
    console.error("Error fetching pending count:", error);
    return 0;
  }

  return count || 0;
}

export default async function DashboardRoadmapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [posts, pendingCount] = await Promise.all([
    getRoadmapPosts(user.id),
    getPendingFeedbackCount(user.id),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Roadmap
        </h1>
        <p className="text-muted-foreground mt-1">
          Drag and drop cards to update their status
        </p>
      </div>

      {/* Pending feedback banner */}
      {pendingCount > 0 && (
        <Link 
          href="/dashboard"
          className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {pendingCount} feedback item{pendingCount !== 1 ? "s" : ""} waiting for review
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Review and add them to your roadmap from the Feedback Board
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Tip for empty roadmap */}
      {posts.length === 0 && pendingCount === 0 && (
        <div className="bg-muted/50 border border-border rounded-xl p-6 mb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Your roadmap is empty</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Share your feedback board with users to collect ideas. 
            When they submit feedback, you can review it and add items to your roadmap.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
          >
            Go to Feedback Board
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <KanbanBoard initialPosts={posts} />
    </div>
  );
}
