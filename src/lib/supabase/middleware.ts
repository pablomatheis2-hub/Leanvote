import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Public routes that don't need auth (used for documentation)
  // Includes: "/", "/auth/login", "/auth/callback", "/b/*"

  // If user is logged in, check if they need onboarding
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, user_type")
      .eq("id", user.id)
      .single();

    // Redirect to onboarding if not completed (except if already on onboarding)
    if (profile && !profile.onboarding_completed && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Prevent completed users from accessing onboarding
    if (profile && profile.onboarding_completed && pathname === "/onboarding") {
      const redirectTo = profile.user_type === "admin" ? "/dashboard" : "/";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Redirect voters away from dashboard to upgrade page
    if (profile && profile.user_type === "voter" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/upgrade", request.url));
    }
  }

  // Protect dashboard routes
  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(`/auth/login?redirect=${pathname}`, request.url));
  }

  // Protect onboarding (needs auth)
  if (!user && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Protect upgrade page (needs auth)
  if (!user && pathname === "/upgrade") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}
