import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicBoardHeader } from "@/components/public-board/header";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import type { PostWithDetails, Profile, Status } from "@/types/database";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBoardOwner(slug: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("board_slug", slug)
    .single();

  return data;
}

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

async function getCurrentUserProfile(userId: string | null): Promise<Profile | null> {
  if (!userId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
}

const statusStyles: Record<Status, { bg: string; dot: string; label: string }> = {
  Open: { bg: "bg-zinc-50", dot: "bg-zinc-400", label: "Open" },
  Planned: { bg: "bg-blue-50", dot: "bg-blue-500", label: "Planned" },
  "In Progress": { bg: "bg-amber-50", dot: "bg-amber-500", label: "In Progress" },
  Complete: { bg: "bg-emerald-50", dot: "bg-emerald-500", label: "Complete" },
};

const categoryStyles: Record<string, string> = {
  Feature: "bg-purple-50 text-purple-700 border-purple-200",
  Bug: "bg-red-50 text-red-700 border-red-200",
  Integration: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const boardOwner = await getBoardOwner(slug);

  if (!boardOwner) {
    return {
      title: "Board Not Found - LeanVote",
    };
  }

  const title = `Roadmap - ${boardOwner.board_name || "Feedback Board"}`;
  const description = `See what's planned and in progress for ${boardOwner.board_name || "this product"}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function PublicRoadmapPage({ params }: PageProps) {
  const { slug } = await params;
  const boardOwner = await getBoardOwner(slug);

  if (!boardOwner) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [posts, currentUserProfile] = await Promise.all([
    getPosts(boardOwner.id),
    getCurrentUserProfile(user?.id || null),
  ]);

  const columns: { status: Status; posts: PostWithDetails[] }[] = [
    { status: "Planned", posts: posts.filter(p => p.status === "Planned") },
    { status: "In Progress", posts: posts.filter(p => p.status === "In Progress") },
    { status: "Complete", posts: posts.filter(p => p.status === "Complete") },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <PublicBoardHeader 
        boardOwner={boardOwner} 
        user={user} 
        profile={currentUserProfile} 
      />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-zinc-900 tracking-tight mb-4">
            Product Roadmap
          </h1>
          <p className="text-lg text-zinc-500 max-w-md mx-auto leading-relaxed">
            See what's coming next for {boardOwner.board_name || "our product"}.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.status} className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className={`w-3 h-3 rounded-full ${statusStyles[column.status].dot}`} />
                <h2 className="font-semibold text-zinc-900">{column.status}</h2>
                <span className="text-sm text-zinc-400">({column.posts.length})</span>
              </div>

              <div className="space-y-3">
                {column.posts.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-zinc-200 p-6 text-center">
                    <p className="text-sm text-zinc-400">No items yet</p>
                  </div>
                ) : (
                  column.posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
                    >
                      <h3 className="font-medium text-zinc-900 mb-2">{post.title}</h3>
                      {post.description && (
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
                          {post.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`text-xs ${categoryStyles[post.category]}`}
                        >
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-zinc-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          {post.vote_count}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
