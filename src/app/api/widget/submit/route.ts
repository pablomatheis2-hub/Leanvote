import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { boardSlug, title, description, type } = await request.json();

    if (!boardSlug || !title) {
      return NextResponse.json(
        { error: "boardSlug and title are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find the profile by board_slug
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("board_slug", boardSlug)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }

    // Find the default project for this user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_id", profile.id)
      .limit(1)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Map widget type to database category
    const categoryMap: Record<string, string> = {
      feature: "feature",
      bug: "bug",
      improvement: "improvement",
    };

    // Create the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        title: title.slice(0, 100),
        description: description?.slice(0, 1000) || null,
        category: categoryMap[type] || "feature",
        project_id: project.id,
        status: "open",
      })
      .select()
      .single();

    if (postError) {
      console.error("Error creating post:", postError);
      return NextResponse.json(
        { error: "Failed to create feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, postId: post.id },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Widget submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Enable CORS for widget
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
