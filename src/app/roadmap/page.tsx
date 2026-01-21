import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { KanbanBoard } from "@/components/roadmap/kanban-board";
import type { PostWithDetails, Profile } from "@/types/database";

export const revalidate = 0;

async function getPosts(): Promise<PostWithDetails[]> {
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

async function getProfile(userId: string | null): Promise<Profile | null> {
  if (!userId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
}

export default async function RoadmapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check admin access
  if (!user) {
    redirect("/?error=unauthorized");
  }

  const profile = await getProfile(user.id);

  if (!profile?.is_admin) {
    redirect("/?error=admin_required");
  }

  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header user={user} profile={profile} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">
              Product Roadmap
            </h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-zinc-900 text-white rounded">
              Admin
            </span>
          </div>
          <p className="text-zinc-500">
            Drag and drop cards to update their status. Changes are saved automatically.
          </p>
        </div>

        <KanbanBoard initialPosts={posts} />
      </main>
    </div>
  );
}
