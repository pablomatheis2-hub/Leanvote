import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/auth/login?error=Missing%20auth%20code`);
  }

  // Collect cookies during the auth flow
  const cookiesToSet: Map<string, { name: string; value: string; options: Record<string, unknown> }> = new Map();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => cookies.forEach((cookie) => cookiesToSet.set(cookie.name, cookie)),
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${siteUrl}/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  // Get user and profile to determine redirect
  const { data: { user } } = await supabase.auth.getUser();
  
  let redirectUrl = "/onboarding";
  
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, user_type")
      .eq("id", user.id)
      .single();

    if (profile?.onboarding_completed) {
      // User has completed onboarding
      if (next) {
        // Honor the redirect parameter (e.g., going back to a board)
        redirectUrl = next;
      } else if (profile.user_type === "admin") {
        redirectUrl = "/dashboard";
      } else {
        // Voters go to LeanVote's public board as default
        redirectUrl = "/b/leanvote";
      }
    } else {
      // New user needs onboarding - pass along the redirect if it's a board
      if (next && next.startsWith("/b/")) {
        redirectUrl = `/onboarding?redirect=${encodeURIComponent(next)}`;
      }
    }
  }

  // Build redirect response with auth cookies
  const response = NextResponse.redirect(`${siteUrl}${redirectUrl}`);

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
