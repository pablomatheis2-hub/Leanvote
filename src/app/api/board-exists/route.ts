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
  
  // Try to find by exact project slug match
  const { data: projectSlugMatch } = await supabase
    .from("projects")
    .select("id, slug, name, company_name")
    .eq("slug", normalizedQuery)
    .single();

  if (projectSlugMatch) {
    return NextResponse.json({ 
      exists: true, 
      slug: projectSlugMatch.slug,
      companyName: projectSlugMatch.company_name || projectSlugMatch.name
    });
  }

  // Try to find by project name (case insensitive)
  const { data: projectNameMatch } = await supabase
    .from("projects")
    .select("id, slug, name, company_name")
    .ilike("name", normalizedQuery)
    .limit(1)
    .single();

  if (projectNameMatch) {
    return NextResponse.json({ 
      exists: true, 
      slug: projectNameMatch.slug,
      companyName: projectNameMatch.company_name || projectNameMatch.name
    });
  }

  // Try to find by company_name (case insensitive)
  const { data: companyNameMatch } = await supabase
    .from("projects")
    .select("id, slug, name, company_name")
    .ilike("company_name", normalizedQuery)
    .limit(1)
    .single();

  if (companyNameMatch) {
    return NextResponse.json({ 
      exists: true, 
      slug: companyNameMatch.slug,
      companyName: companyNameMatch.company_name || companyNameMatch.name
    });
  }

  // Try to find by exact company_url (normalized)
  const normalizedUrl = normalizeUrl(query);
  const { data: urlMatch } = await supabase
    .from("projects")
    .select("id, slug, name, company_name")
    .eq("company_url", normalizedUrl)
    .limit(1)
    .single();

  if (urlMatch) {
    return NextResponse.json({ 
      exists: true, 
      slug: urlMatch.slug,
      companyName: urlMatch.company_name || urlMatch.name
    });
  }

  // Try partial match on company_url
  const { data: partialUrlMatch } = await supabase
    .from("projects")
    .select("id, slug, name, company_name")
    .ilike("company_url", `%${normalizedUrl}%`)
    .limit(1)
    .single();

  if (partialUrlMatch) {
    return NextResponse.json({ 
      exists: true, 
      slug: partialUrlMatch.slug,
      companyName: partialUrlMatch.company_name || partialUrlMatch.name
    });
  }

  return NextResponse.json({ exists: false });
}
