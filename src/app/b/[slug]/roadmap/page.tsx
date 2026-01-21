import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicBoardHeader } from "@/components/public-board/header";
import { PublicRoadmapBoard } from "@/components/public-board/roadmap-board";
import type { Metadata } from "next";
import type { PostWithDetails, Profile } from "@/types/database";

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

async function getUserVotes(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();

  const supabase = await createClient();
  const { data } = await supabase
    .from("votes")
    .select("post_id")
    .eq("user_id", userId);

  return new Set((data || []).map((v) => v.post_id));
}

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

  const [posts, currentUserProfile, userVotes] = await Promise.all([
    getPosts(boardOwner.id),
    getCurrentUserProfile(user?.id || null),
    getUserVotes(user?.id || null),
  ]);

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
            See what&apos;s coming next for {boardOwner.board_name || "our product"}.
          </p>
        </header>

        <PublicRoadmapBoard 
          posts={posts}
          userVotes={userVotes}
          isLoggedIn={!!user}
          slug={slug}
        />
      </main>
    </div>
  );
}
