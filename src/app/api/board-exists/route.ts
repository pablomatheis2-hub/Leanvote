import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function normalizeUrl(url: string): string {
  // Remove protocol, www, and trailing slash for consistent matching
  return url.toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("slug") || searchParams.get("query");

  if (!query) {
    return NextResponse.json({ exists: false, error: "No search query provided" });
  }

  const supabase = await createClient();
  const normalizedQuery = query.toLowerCase().trim();
  
  // First, try to find by exact project slug match
  const { data: projectSlugMatch } = await supabase
    .from("projects")
    .select(`
      id,
      slug,
      name,
      company_name,
      owner_id,
      profiles:owner_id (
        board_slug
      )
    `)
    .eq("slug", normalizedQuery)
    .single();

  if (projectSlugMatch) {
    const projectProfile = Array.isArray(projectSlugMatch.profiles) 
      ? projectSlugMatch.profiles[0] 
      : projectSlugMatch.profiles;
    if (projectProfile?.board_slug) {
      return NextResponse.json({ 
        exists: true, 
        slug: projectProfile.board_slug,
        projectSlug: projectSlugMatch.slug,
        companyName: projectSlugMatch.company_name || projectSlugMatch.name
      });
    }
  }

  // Try to find by project name (case insensitive)
  const { data: projectNameMatch } = await supabase
    .from("projects")
    .select(`
      id,
      slug,
      name,
      company_name,
      owner_id,
      profiles:owner_id (
        board_slug
      )
    `)
    .ilike("name", normalizedQuery)
    .limit(1)
    .single();

  if (projectNameMatch) {
    const nameProfile = Array.isArray(projectNameMatch.profiles) 
      ? projectNameMatch.profiles[0] 
      : projectNameMatch.profiles;
    if (nameProfile?.board_slug) {
      return NextResponse.json({ 
        exists: true, 
        slug: nameProfile.board_slug,
        projectSlug: projectNameMatch.slug,
        companyName: projectNameMatch.company_name || projectNameMatch.name
      });
    }
  }

  // Try to find by company_name (case insensitive)
  const { data: companyNameMatch } = await supabase
    .from("projects")
    .select(`
      id,
      slug,
      name,
      company_name,
      owner_id,
      profiles:owner_id (
        board_slug
      )
    `)
    .ilike("company_name", normalizedQuery)
    .limit(1)
    .single();

  if (companyNameMatch) {
    const companyProfile = Array.isArray(companyNameMatch.profiles) 
      ? companyNameMatch.profiles[0] 
      : companyNameMatch.profiles;
    if (companyProfile?.board_slug) {
      return NextResponse.json({ 
        exists: true, 
        slug: companyProfile.board_slug,
        projectSlug: companyNameMatch.slug,
        companyName: companyNameMatch.company_name || companyNameMatch.name
      });
    }
  }

  // Try to find by exact company_url (normalized)
  const normalizedUrl = normalizeUrl(query);
  const { data: urlMatch } = await supabase
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
    .eq("company_url", normalizedUrl)
    .limit(1)
    .single();

  if (urlMatch) {
    const urlProfile = Array.isArray(urlMatch.profiles) 
      ? urlMatch.profiles[0] 
      : urlMatch.profiles;
    if (urlProfile?.board_slug) {
      return NextResponse.json({ 
        exists: true, 
        slug: urlProfile.board_slug,
        projectSlug: urlMatch.slug,
        companyName: urlMatch.company_name || urlMatch.name
      });
    }
  }

  // Try partial match on company_url
  const { data: partialUrlMatch } = await supabase
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
    .ilike("company_url", `%${normalizedUrl}%`)
    .limit(1)
    .single();

  if (partialUrlMatch) {
    const partialProfile = Array.isArray(partialUrlMatch.profiles) 
      ? partialUrlMatch.profiles[0] 
      : partialUrlMatch.profiles;
    if (partialProfile?.board_slug) {
      return NextResponse.json({ 
        exists: true, 
        slug: partialProfile.board_slug,
        projectSlug: partialUrlMatch.slug,
        companyName: partialUrlMatch.company_name || partialUrlMatch.name
      });
    }
  }

  // Fallback: Try to find by board_slug in profiles (for backwards compatibility)
  const { data: profileMatch } = await supabase
    .from("profiles")
    .select("id, board_slug, board_name")
    .eq("board_slug", normalizedQuery)
    .single();

  if (profileMatch?.board_slug) {
    return NextResponse.json({ 
      exists: true, 
      slug: profileMatch.board_slug,
      companyName: profileMatch.board_name
    });
  }

  return NextResponse.json({ exists: false });
}
