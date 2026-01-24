import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronUp } from "lucide-react";
import { PublicBoardHeader } from "@/components/public-board/header";
import { Comments } from "@/components/public-board/comments";
import { Badge } from "@/components/ui/badge";
import { getComments } from "@/lib/actions/comments";
import type { Metadata } from "next";
import type { PostWithDetails, Profile, Project } from "@/types/database";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string; postId: string }>;
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

async function getBoardOwnerById(ownerId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", ownerId)
    .single();

  return data;
}

async function getPost(postId: string): Promise<PostWithDetails | null> {
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
    .eq("id", postId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    author_name: data.profiles?.full_name || null,
    author_avatar: data.profiles?.avatar_url || null,
    vote_count: data.votes?.length || 0,
  };
}

async function getUserVote(userId: string | null, postId: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = await createClient();
  const { data } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .single();

  return !!data;
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

const statusStyles: Record<string, string> = {
  Open: "bg-zinc-100 text-zinc-700 border-zinc-200",
  Planned: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const categoryStyles: Record<string, string> = {
  Feature: "bg-purple-50 text-purple-700 border-purple-200",
  Bug: "bg-red-50 text-red-700 border-red-200",
  Integration: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, postId } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: "Post Not Found - LeanVote" };
  }

  const boardName = project.company_name || project.name;
  const post = await getPost(postId);
  
  if (!post) {
    return { title: "Post Not Found - LeanVote" };
  }

  return {
    title: `${post.title} - ${boardName}`,
    description: post.description || `View feedback and comments for ${post.title}`,
    openGraph: {
      title: post.title,
      description: post.description || undefined,
      type: "article",
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug, postId } = await params;
  const project = await getProject(slug);
  
  if (!project) {
    notFound();
  }

  const boardOwner = await getBoardOwnerById(project.owner_id);
  
  if (!boardOwner) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [post, userHasVoted, currentUserProfile, comments] = await Promise.all([
    getPost(postId),
    getUserVote(user?.id || null, postId),
    getCurrentUserProfile(user?.id || null),
    getComments(postId),
  ]);

  if (!post) {
    notFound();
  }

  // Check if the post belongs to this board
  if (post.board_owner_id !== boardOwner.id) {
    notFound();
  }

  const isBoardOwner = user?.id === boardOwner.id;

  return (
    <div className="min-h-screen bg-zinc-50">
      <PublicBoardHeader
        project={project}
        user={user}
        profile={currentUserProfile}
      />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href={`/b/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all feedback
        </Link>

        {/* Post card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
          <div className="flex gap-4">
            {/* Vote button */}
            <div
              className={`flex flex-col items-center min-w-[64px] py-3 px-4 rounded-xl border ${
                userHasVoted
                  ? "bg-[#fff5f2] border-[#f97352] text-[#f97352]"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600"
              }`}
            >
              <ChevronUp className={`w-6 h-6 ${userHasVoted ? "text-[#f97352]" : ""}`} />
              <span className="text-xl font-bold">{post.vote_count}</span>
              <span className="text-[10px] uppercase tracking-wide font-medium">votes</span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-zinc-900 mb-3">
                {post.title}
              </h1>

              {post.description && (
                <p className="text-zinc-600 leading-relaxed mb-4 whitespace-pre-wrap">
                  {post.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`text-xs ${categoryStyles[post.category]}`}>
                  {post.category}
                </Badge>
                <Badge variant="outline" className={`text-xs ${statusStyles[post.status]}`}>
                  {post.status}
                </Badge>
                <span className="text-xs text-zinc-400">
                  by {post.author_name || "Anonymous"} • {new Date(post.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <Comments
            postId={postId}
            initialComments={comments}
            isLoggedIn={!!user}
            currentUserId={user?.id || null}
            isBoardOwner={isBoardOwner}
            slug={slug}
          />
        </div>
      </main>
    </div>
  );
}
