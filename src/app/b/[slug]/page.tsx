import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicBoardHeader } from "@/components/public-board/header";
import { PublicPostList } from "@/components/public-board/post-list";
import type { Metadata } from "next";
import type { PostWithDetails, Profile, Project } from "@/types/database";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  return data;
}

async function getBoardOwner(ownerId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", ownerId)
    .single();

  return data;
}

async function getPosts(boardOwnerId: string, projectId?: string): Promise<PostWithDetails[]> {
  const supabase = await createClient();
  
  let query = supabase
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

  // If project is specified, filter by project_id
  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

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
  const project = await getProject(slug);
  
  if (!project) {
    return {
      title: "Board Not Found - LeanVote",
      robots: { index: false, follow: false },
    };
  }

  const boardName = project.company_name || project.name;
  const title = `${boardName} Feedback Board`;
  const description = project.description 
    || `Share your ideas, report bugs, and vote on what matters most for ${boardName}. Help shape the product roadmap.`;

  return {
    title,
    description,
    alternates: { canonical: `/b/${slug}` },
    openGraph: {
      title: `${boardName} - Customer Feedback Board`,
      description,
      url: `/b/${slug}`,
      type: "website",
      siteName: "LeanVote",
    },
    twitter: {
      card: "summary_large_image",
      title: `${boardName} - Customer Feedback Board`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function PublicBoardPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  
  if (!project) {
    notFound();
  }

  const boardOwner = await getBoardOwner(project.owner_id);
  
  if (!boardOwner) {
    notFound();
  }

  const displayName = project.company_name || project.name;
  const displayDescription = project.description || "Share your ideas, report bugs, and vote on what matters most.";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [posts, userVotes, currentUserProfile] = await Promise.all([
    getPosts(boardOwner.id, project.id),
    getUserVotes(user?.id || null),
    getCurrentUserProfile(user?.id || null),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <PublicBoardHeader 
        project={project}
        user={user} 
        profile={currentUserProfile} 
      />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight mb-2 sm:mb-3">
            {displayName}
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 max-w-md mx-auto px-4 sm:px-0">
            {displayDescription}
          </p>
        </header>

        <PublicPostList 
          posts={posts} 
          userVotes={userVotes} 
          isLoggedIn={!!user}
          boardOwnerId={boardOwner.id}
          slug={slug}
          projectId={project.id}
        />
      </main>
    </div>
  );
}
