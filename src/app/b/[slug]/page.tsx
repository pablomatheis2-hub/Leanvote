import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicBoardHeader } from "@/components/public-board/header";
import { PublicPostList } from "@/components/public-board/post-list";
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

async function getUserVotes(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();

  const supabase = await createClient();
  const { data } = await supabase
    .from("votes")
    .select("post_id")
    .eq("user_id", userId);

  return new Set((data || []).map((v) => v.post_id));
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const boardOwner = await getBoardOwner(slug);

  if (!boardOwner) {
    return {
      title: "Board Not Found - LeanVote",
    };
  }

  const title = `${boardOwner.board_name || "Feedback Board"} - LeanVote`;
  const description = `Share your ideas, report bugs, and vote on what matters most for ${boardOwner.board_name || "this product"}.`;

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

export default async function PublicBoardPage({ params }: PageProps) {
  const { slug } = await params;
  const boardOwner = await getBoardOwner(slug);

  if (!boardOwner) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [posts, userVotes, currentUserProfile] = await Promise.all([
    getPosts(boardOwner.id),
    getUserVotes(user?.id || null),
    getCurrentUserProfile(user?.id || null),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <PublicBoardHeader 
        boardOwner={boardOwner} 
        user={user} 
        profile={currentUserProfile} 
      />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-semibold text-zinc-900 tracking-tight">
            {boardOwner.company_name || boardOwner.board_name || "Feedback Board"}
          </h1>
          <p className="mt-2 text-zinc-500">
            {boardOwner.company_description || "Share your ideas, report bugs, and vote on what matters most."}
          </p>
        </div>

        <PublicPostList 
          posts={posts} 
          userVotes={userVotes} 
          isLoggedIn={!!user}
          boardOwnerId={boardOwner.id}
          slug={slug}
        />
      </main>
    </div>
  );
}
