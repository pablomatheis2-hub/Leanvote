import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Use the configured site URL, or fall back to the request origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const redirectUrl = `${siteUrl}${next}`;

  console.log("Auth callback - code:", code ? "present" : "missing");
  console.log("Auth callback - request cookies:", request.cookies.getAll().map(c => c.name));

  if (code) {
    // Store cookies to set them on the response later
    const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies = request.cookies.getAll();
            console.log("Supabase getAll called, returning:", cookies.map(c => c.name));
            return cookies;
          },
          setAll(cookies) {
            console.log("Supabase setAll called with:", cookies.map(c => c.name));
            cookies.forEach((cookie) => {
              cookiesToSet.push(cookie);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Exchange result - error:", error?.message || "none");
    console.log("Exchange result - session:", data?.session ? "present" : "missing");
    console.log("Exchange result - user:", data?.user?.email || "none");

    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(`${siteUrl}/auth/login?error=${encodeURIComponent(error.message)}`);
    }

    // Create response and attach all cookies
    const response = NextResponse.redirect(redirectUrl);
    
    console.log("Cookies to set:", cookiesToSet.map(c => c.name));
    
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        ...options,
      });
    });

    return response;
  }

  return NextResponse.redirect(`${siteUrl}/auth/login?error=No%20code%20provided`);
}
