import { createClient } from "@/lib/supabase/server";
import { DashboardPostList } from "@/components/dashboard/post-list";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import type { PostWithDetails, Profile } from "@/types/database";

export const revalidate = 0;

async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
}

async function getPosts(boardOwnerId: string): Promise<PostWithDetails[]> {
  const supabase = await createClient();
  
  // Fetch all posts (including those promoted to roadmap) to show them with status badges
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

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile, posts] = await Promise.all([
    getProfile(user.id),
    getPosts(user.id),
  ]);

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/b/${profile?.board_slug}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Feedback Board
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage feedback and feature requests submitted by your users
          </p>
        </div>
      </div>

      {/* Public link card */}
      <div className="bg-card rounded-xl border border-border p-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-1">
              Share your feedback board
            </p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded truncate">
                {publicUrl}
              </code>
              <CopyButton text={publicUrl} />
            </div>
          </div>
          <Link
            href={`/b/${profile?.board_slug}`}
            target="_blank"
            className="ml-4 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Feedback</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{posts.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{posts.filter(p => p.status === "Open").length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">On Roadmap</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{posts.filter(p => p.status !== "Open" && p.status !== "Complete").length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Complete</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{posts.filter(p => p.status === "Complete").length}</p>
        </div>
      </div>

      {/* Posts List */}
      <DashboardPostList posts={posts} boardSlug={profile?.board_slug || ""} />
    </div>
  );
}
