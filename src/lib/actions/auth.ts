"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signInWithGitHub(redirectTo?: string) {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const callbackUrl = redirectTo 
    ? `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`
    : `${siteUrl}/auth/callback`;
    
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const callbackUrl = redirectTo 
    ? `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`
    : `${siteUrl}/auth/callback`;
    
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getUserRedirect(intendedRedirect?: string): Promise<string> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return "/";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, user_type")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    // Pass the redirect to onboarding if it's a board
    if (intendedRedirect?.startsWith("/b/")) {
      return `/onboarding?redirect=${encodeURIComponent(intendedRedirect)}`;
    }
    return "/onboarding";
  }

  // If there's an intended redirect (e.g., a board), use it
  if (intendedRedirect) {
    return intendedRedirect;
  }

  // Admin users go to dashboard, voters go to LeanVote's public board as default
  return profile.user_type === "admin" ? "/dashboard" : "/b/leanvote";
}