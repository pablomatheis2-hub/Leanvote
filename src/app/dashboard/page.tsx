import { createClient } from "@/lib/supabase/server";
import { DashboardPostList } from "@/components/dashboard/post-list";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import type { PostWithDetails, Project } from "@/types/database";

export const revalidate = 0;

async function getProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  return data || [];
}

async function getPosts(boardOwnerId: string, projectId?: string): Promise<PostWithDetails[]> {
  const supabase = await createClient();

  // Fetch all posts (including those promoted to roadmap) to show them with status badges
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
    .eq("board_owner_id", boardOwnerId);

  // Filter by project_id if specified
  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

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

interface PageProps {
  searchParams: Promise<{ project?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const params = await searchParams;
  const projects = await getProjects(user.id);

  // Determine current project
  const currentProject = params.project
    ? projects.find(p => p.id === params.project)
    : projects.find(p => p.is_default) || projects[0];

  const posts = await getPosts(user.id, currentProject?.id);

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/b/${currentProject?.slug}`;

  const openCount = posts.filter(p => p.status === "Open").length;
  const roadmapCount = posts.filter(p => p.status !== "Open" && p.status !== "Complete").length;
  const completeCount = posts.filter(p => p.status === "Complete").length;

  return (
    <div className="space-y-6">
      {/* Compact Header with Share Link */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Feedback
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 bg-muted rounded-full">{posts.length} total</span>
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full">{openCount} open</span>
            <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-full">{roadmapCount} in progress</span>
            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full">{completeCount} done</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded hidden sm:block truncate max-w-[200px]">
            {publicUrl}
          </code>
          <CopyButton text={publicUrl} />
          <Link
            href={`/b/${currentProject?.slug}`}
            target="_blank"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Link>
        </div>
      </div>

      {/* Posts List */}
      <DashboardPostList posts={posts} boardSlug={currentProject?.slug || ""} />
    </div>
  );
}
