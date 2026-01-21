import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { PostList } from "@/components/post-list";
import type { Metadata } from "next";
import type { PostWithDetails, Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "LeanVote - Customer Feedback Board",
  description: "Share your ideas, report bugs, and vote on what matters most. A simple feedback board for your product.",
  openGraph: {
    title: "LeanVote - Customer Feedback Board",
    description: "Share your ideas, report bugs, and vote on what matters most.",
    type: "website",
  },
};

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

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [posts, userVotes, profile] = await Promise.all([
    getPosts(),
    getUserVotes(user?.id || null),
    getProfile(user?.id || null),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header user={user} profile={profile} />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">
            Feedback Board
          </h1>
          <p className="mt-2 text-zinc-500">
            Share your ideas, report bugs, and vote on what matters most.
          </p>
        </div>

        <PostList 
          posts={posts} 
          userVotes={userVotes} 
          isLoggedIn={!!user} 
        />
      </main>
    </div>
  );
}
