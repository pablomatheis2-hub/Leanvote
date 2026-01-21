import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButtonServer } from "@/components/vote-button-server";
import Link from "next/link";
import type { Metadata } from "next";
import type { PostWithDetails, Profile, Status } from "@/types/database";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPost(id: string): Promise<PostWithDetails | null> {
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
    .eq("id", id)
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

async function hasUserVoted(userId: string | null, postId: string): Promise<boolean> {
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: "Post Not Found - LeanVote",
    };
  }

  const title = `${post.title} - LeanVote`;
  const description = post.description || `${post.category} feedback: ${post.title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

const categoryStyles: Record<string, string> = {
  Feature: "bg-blue-50 text-blue-700 border-blue-200",
  Bug: "bg-red-50 text-red-700 border-red-200",
  Integration: "bg-purple-50 text-purple-700 border-purple-200",
};

const statusStyles: Record<Status, { bg: string; dot: string; label: string }> = {
  Open: { bg: "bg-zinc-100 text-zinc-700", dot: "bg-zinc-400", label: "Open for voting" },
  Planned: { bg: "bg-amber-50 text-amber-700", dot: "bg-amber-400", label: "Planned for development" },
  "In Progress": { bg: "bg-blue-50 text-blue-700", dot: "bg-blue-400", label: "Currently in development" },
  Complete: { bg: "bg-green-50 text-green-700", dot: "bg-green-400", label: "Shipped" },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [post, profile, hasVoted] = await Promise.all([
    getPost(id),
    getProfile(user?.id || null),
    hasUserVoted(user?.id || null, id),
  ]);

  if (!post) {
    notFound();
  }

  const status = statusStyles[post.status];
  const initials = post.author_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header user={user} profile={profile} />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Feedback Board
        </Link>

        <article className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start gap-6">
              <VoteButtonServer
                postId={post.id}
                initialVoteCount={post.vote_count}
                initialHasVoted={hasVoted}
                isLoggedIn={!!user}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium border", categoryStyles[post.category])}
                  >
                    {post.category}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs font-medium flex items-center gap-1.5", status.bg)}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                    {post.status}
                  </Badge>
                </div>

                <h1 className="text-2xl font-semibold text-zinc-900 mb-4">
                  {post.title}
                </h1>

                {post.description && (
                  <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                    {post.description}
                  </p>
                )}

                <div className="mt-8 pt-6 border-t border-zinc-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author_avatar || undefined} />
                      <AvatarFallback className="text-sm bg-zinc-100">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-zinc-900">
                        {post.author_name || "Anonymous"}
                      </p>
                      <p className="text-sm text-zinc-500">
                        Posted on {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cn("px-8 py-4 border-t", status.bg)}>
            <p className="text-sm font-medium flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", status.dot)} />
              {status.label}
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
