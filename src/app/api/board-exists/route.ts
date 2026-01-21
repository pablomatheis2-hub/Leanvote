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
  
  // First, try to find by exact board_slug match
  const { data: slugMatch } = await supabase
    .from("profiles")
    .select("id, board_slug, company_name")
    .eq("board_slug", query.toLowerCase())
    .single();

  if (slugMatch) {
    return NextResponse.json({ 
      exists: true, 
      slug: slugMatch.board_slug,
      companyName: slugMatch.company_name
    });
  }

  // Next, try to find by company_url (normalized)
  const normalizedQuery = normalizeUrl(query);
  const { data: urlMatch } = await supabase
    .from("profiles")
    .select("id, board_slug, company_name, company_url")
    .eq("company_url", normalizedQuery)
    .single();

  if (urlMatch) {
    return NextResponse.json({ 
      exists: true, 
      slug: urlMatch.board_slug,
      companyName: urlMatch.company_name
    });
  }

  // Finally, try partial match on company_url (for cases like "acme.com" matching "acme.com/feedback")
  const { data: partialMatch } = await supabase
    .from("profiles")
    .select("id, board_slug, company_name, company_url")
    .ilike("company_url", `%${normalizedQuery}%`)
    .limit(1)
    .single();

  if (partialMatch) {
    return NextResponse.json({ 
      exists: true, 
      slug: partialMatch.board_slug,
      companyName: partialMatch.company_name
    });
  }

  return NextResponse.json({ exists: false });
}
