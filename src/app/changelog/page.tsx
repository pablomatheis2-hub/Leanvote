import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import type { PostWithDetails, Profile } from "@/types/database";

export const revalidate = 0;

interface GroupedChangelog {
  month: string;
  posts: PostWithDetails[];
}

async function getCompletedPosts(): Promise<PostWithDetails[]> {
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
    .eq("status", "Complete")
    .order("updated_at", { ascending: false });

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

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getCompletedPosts();
  const latestPost = posts[0];

  const title = "Changelog - LeanVote";
  const description = latestPost
    ? `Latest update: ${latestPost.title}. See all the features and improvements we've shipped.`
    : "See all the features and improvements we've shipped for LeanVote.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
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

export default async function ChangelogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getProfile(user?.id || null);

  const posts = await getCompletedPosts();
  const groupedPosts = groupByMonth(posts);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header user={user} profile={profile} />

      <main className="max-w-2xl mx-auto px-6 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-semibold text-zinc-900 tracking-tight mb-4">
            Changelog
          </h1>
          <p className="text-lg text-zinc-500 max-w-md mx-auto leading-relaxed">
            New updates and improvements to LeanVote.
          </p>
        </header>

        {groupedPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-1">No updates yet</h3>
            <p className="text-zinc-500 text-sm">
              Check back soon for new features and improvements.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedPosts.map((group) => (
              <section key={group.month}>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-8 text-center">
                  {group.month}
                </h2>
                <div className="space-y-8">
                  {group.posts.map((post) => (
                    <article
                      key={post.id}
                      className="relative pl-8 border-l-2 border-zinc-200"
                    >
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-4 border-white" />
                      <div className="pb-8">
                        <div className="flex items-center gap-3 mb-2">
                          <time className="text-sm text-zinc-400 font-medium">
                            {formatDate(post.updated_at)}
                          </time>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium border ${categoryStyles[post.category]}`}
                          >
                            {post.category}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                          {post.title}
                        </h3>
                        {post.description && (
                          <p className="text-zinc-600 leading-relaxed">
                            {post.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span>{post.vote_count} votes</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-100 py-8 mt-16">
        <p className="text-center text-sm text-zinc-400">
          Have a feature request?{" "}
          <a href="/" className="text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
            Submit feedback
          </a>
        </p>
      </footer>
    </div>
  );
}
