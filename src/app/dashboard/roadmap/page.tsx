import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/roadmap/kanban-board";
import type { PostWithDetails } from "@/types/database";

export const revalidate = 0;

async function getPosts(boardOwnerId: string): Promise<PostWithDetails[]> {
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

export default async function DashboardRoadmapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const posts = await getPosts(user.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Roadmap
        </h1>
        <p className="text-zinc-500 mt-1">
          Drag and drop cards to update their status
        </p>
      </div>

      <KanbanBoard initialPosts={posts} />
    </div>
  );
}
