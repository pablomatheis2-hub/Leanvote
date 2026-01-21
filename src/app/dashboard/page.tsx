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
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Feedback Board
          </h1>
          <p className="text-zinc-500 mt-1">
            Manage feedback and feature requests submitted by your users
          </p>
        </div>
      </div>

      {/* Public link card */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 mb-1">
              Share your feedback board
            </p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded truncate">
                {publicUrl}
              </code>
              <CopyButton text={publicUrl} />
            </div>
          </div>
          <Link
            href={`/b/${profile?.board_slug}`}
            target="_blank"
            className="ml-4 flex items-center gap-1.5 text-sm text-[#f97352] hover:text-[#e8634a] font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Posts", value: posts.length },
          { label: "Open", value: posts.filter(p => p.status === "Open").length },
          { label: "In Progress", value: posts.filter(p => p.status === "Planned" || p.status === "In Progress").length },
          { label: "Completed", value: posts.filter(p => p.status === "Complete").length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="text-2xl font-semibold text-zinc-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Posts List */}
      <DashboardPostList posts={posts} />
    </div>
  );
}
