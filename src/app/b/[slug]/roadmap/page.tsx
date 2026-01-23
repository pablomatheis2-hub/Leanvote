import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicBoardHeader } from "@/components/public-board/header";
import { PublicRoadmapBoard } from "@/components/public-board/roadmap-board";
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

async function getBoardOwnerBySlug(slug: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("board_slug", slug)
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
    .in("status", ["Planned", "In Progress", "Complete"])
    .order("created_at", { ascending: false });

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
  
  const project = await getProject(slug);
  let boardName: string;

  if (project) {
    boardName = project.company_name || project.name;
  } else {
    const boardOwner = await getBoardOwnerBySlug(slug);
    if (!boardOwner) {
      return {
        title: "Board Not Found - LeanVote",
        robots: { index: false, follow: false },
      };
    }
    boardName = boardOwner.board_name || "Product";
  }

  const title = `${boardName} Product Roadmap`;
  const description = `See what's planned, in progress, and completed for ${boardName}. Track feature development and upcoming releases.`;

  return {
    title,
    description,
    alternates: { canonical: `/b/${slug}/roadmap` },
    openGraph: {
      title: `${boardName} Product Roadmap`,
      description,
      url: `/b/${slug}/roadmap`,
      type: "website",
      siteName: "LeanVote",
    },
    twitter: {
      card: "summary_large_image",
      title: `${boardName} Product Roadmap`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function PublicRoadmapPage({ params }: PageProps) {
  const { slug } = await params;
  
  const project = await getProject(slug);
  
  let boardOwner: Profile | null = null;
  let displayName: string;
  
  if (project) {
    boardOwner = await getBoardOwner(project.owner_id);
    displayName = project.company_name || project.name;
  } else {
    boardOwner = await getBoardOwnerBySlug(slug);
    displayName = boardOwner?.board_name || "our product";
  }

  if (!boardOwner) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [posts, currentUserProfile, userVotes] = await Promise.all([
    getPosts(boardOwner.id, project?.id),
    getCurrentUserProfile(user?.id || null),
    getUserVotes(user?.id || null),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <PublicBoardHeader 
        boardOwner={boardOwner}
        boardName={displayName}
        user={user} 
        profile={currentUserProfile} 
      />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight mb-3">
            Product Roadmap
          </h1>
          <p className="text-lg text-zinc-500 max-w-md mx-auto">
            See what&apos;s coming next for {displayName}.
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
