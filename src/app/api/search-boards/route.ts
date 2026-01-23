import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const normalizedQuery = query.toLowerCase().trim();
  
  // Search projects by name, slug, company_name, or company_url
  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      id,
      slug,
      name,
      company_name,
      company_url,
      owner_id,
      profiles:owner_id (
        board_slug
      )
    `)
    .or(`name.ilike.%${normalizedQuery}%,slug.ilike.%${normalizedQuery}%,company_name.ilike.%${normalizedQuery}%,company_url.ilike.%${normalizedQuery}%`)
    .limit(5);

  if (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] });
  }

  // Transform results to include the board slug for navigation
  const results = (projects || [])
    .map(project => {
      const profile = Array.isArray(project.profiles) 
        ? project.profiles[0] 
        : project.profiles;
      return {
        id: project.id,
        name: project.name,
        companyName: project.company_name,
        companyUrl: project.company_url,
        projectSlug: project.slug,
        boardSlug: profile?.board_slug,
      };
    })
    .filter(p => p.boardSlug);

  return NextResponse.json({ results });
}
