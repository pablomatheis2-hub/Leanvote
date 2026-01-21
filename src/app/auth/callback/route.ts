import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Use the configured site URL, or fall back to the request origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const redirectUrl = `${siteUrl}${next}`;

  if (code) {
    // Store cookies to set them on the response later
    const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookies) {
            cookies.forEach((cookie) => {
              cookiesToSet.push(cookie);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(`${siteUrl}/auth/login?error=${encodeURIComponent(error.message)}`);
    }

    // Create response and attach all cookies
    const response = NextResponse.redirect(redirectUrl);
    
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

    console.log("Setting cookies:", cookiesToSet.map(c => c.name));

    return response;
  }

  return NextResponse.redirect(`${siteUrl}/auth/login?error=No%20code%20provided`);
}
