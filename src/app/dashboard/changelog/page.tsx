import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ArrowRight, CheckCircle2, Lightbulb } from "lucide-react";
import type { PostWithDetails, Profile, Project } from "@/types/database";

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

async function getProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  return data || [];
}

async function getCompletedPosts(boardOwnerId: string, projectId?: string): Promise<PostWithDetails[]> {
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
    .eq("status", "Complete");

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching completed posts:", error);
    return [];
  }

  return (data || []).map((post) => ({
    ...post,
    author_name: post.profiles?.full_name || null,
    author_avatar: post.profiles?.avatar_url || null,
    vote_count: post.votes?.length || 0,
  }));
}

async function getInProgressCount(boardOwnerId: string, projectId?: string): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("board_owner_id", boardOwnerId)
    .eq("status", "In Progress");

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Error fetching in-progress count:", error);
    return 0;
  }

  return count || 0;
}

interface GroupedChangelog {
  month: string;
  posts: PostWithDetails[];
}

function groupByMonth(posts: PostWithDetails[]): GroupedChangelog[] {
  const groups: Record<string, PostWithDetails[]> = {};

  posts.forEach((post) => {
    const date = new Date(post.updated_at);
    const monthKey = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(post);
  });

  return Object.entries(groups).map(([month, posts]) => ({
    month,
    posts,
  }));
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const categoryStyles: Record<string, string> = {
  Feature: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  Bug: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
  Integration: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
};

interface PageProps {
  searchParams: Promise<{ project?: string }>;
}

export default async function DashboardChangelogPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const params = await searchParams;
  const [profile, projects] = await Promise.all([
    getProfile(user.id),
    getProjects(user.id),
  ]);

  // Determine current project
  const currentProject = params.project 
    ? projects.find(p => p.id === params.project)
    : projects.find(p => p.is_default) || projects[0];

  const [posts, inProgressCount] = await Promise.all([
    getCompletedPosts(user.id, currentProject?.id),
    getInProgressCount(user.id, currentProject?.id),
  ]);

  const groupedPosts = groupByMonth(posts);
  
  // Build the project param for links
  const projectParam = params.project ? `?project=${params.project}` : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Changelog
          </h1>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
            {posts.length} shipped
          </span>
        </div>
        {(currentProject?.slug || profile?.board_slug) && (
          <Link
            href={`/b/${currentProject?.slug || profile?.board_slug}/changelog`}
            target="_blank"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Public Changelog</span>
            <span className="sm:hidden">Preview</span>
          </Link>
        )}
      </div>

      {/* In-progress banner */}
      {inProgressCount > 0 && (
        <Link 
          href={`/dashboard/roadmap${projectParam}`}
          className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">
                {inProgressCount} item{inProgressCount !== 1 ? "s" : ""} in progress
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Mark them as complete to add them to your changelog
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Empty state */}
      {posts.length === 0 ? (
        <div className="bg-muted/50 border border-border rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-medium text-foreground mb-2">No completed items yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            When you mark items as complete on your roadmap, they&apos;ll appear here and on your public changelog.
          </p>
          <Link 
            href={`/dashboard/roadmap${projectParam}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
          >
            Go to Roadmap
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedPosts.map((group) => (
            <section key={group.month}>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                {group.month}
              </h2>
              <div className="bg-card rounded-xl border border-border divide-y divide-border">
                {group.posts.map((post) => (
                  <div key={post.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <time className="text-xs text-muted-foreground">
                            {formatDate(post.updated_at)}
                          </time>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium border ${categoryStyles[post.category]}`}
                          >
                            {post.category}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-foreground">
                          {post.title}
                        </h3>
                        {post.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {post.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span>{post.vote_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
