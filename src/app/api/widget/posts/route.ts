import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const boardSlug = searchParams.get("slug");

  if (!boardSlug) {
    return NextResponse.json(
      { error: "Board slug is required", posts: [] },
      { status: 400, headers: corsHeaders }
    );
  }

  const supabase = await createClient();

  // Find project by slug
  const { data: project } = await supabase
    .from("projects")
    .select("id, owner_id")
    .eq("slug", boardSlug)
    .single();

  if (!project) {
    return NextResponse.json(
      { error: "Board not found", posts: [] },
      { status: 404, headers: corsHeaders }
    );
  }

  // Get recent posts with vote counts for this project
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      description,
      category,
      status,
      created_at,
      votes (id)
    `)
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const formattedPosts = (posts || []).map((post) => ({
    id: post.id,
    title: post.title,
    description: post.description,
    category: post.category,
    status: post.status,
    votes: Array.isArray(post.votes) ? post.votes.length : 0,
  }));

  return NextResponse.json(
    { posts: formattedPosts },
    { headers: corsHeaders }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
