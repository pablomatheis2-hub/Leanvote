"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeOnboardingAsVoter() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      user_type: "voter",
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function completeOnboardingAsAdmin() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in" };
  }

  // Get current profile to build board slug
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Generate board slug
  const slugBase = profile?.full_name || user.email?.split("@")[0] || "board";
  const baseSlug = slugBase.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  
  // Check for slug uniqueness and append number if needed
  let finalSlug = baseSlug;
  let counter = 0;
  
  while (true) {
    const checkSlug = counter > 0 ? `${baseSlug}-${counter}` : baseSlug;
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("board_slug", checkSlug)
      .neq("id", user.id)
      .single();
    
    if (!existing) {
      finalSlug = checkSlug;
      break;
    }
    counter++;
  }

  const boardName = (profile?.full_name || user.email?.split("@")[0] || "My") + "'s Feedback";
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  const { error } = await supabase
    .from("profiles")
    .update({
      user_type: "admin",
      board_slug: finalSlug,
      board_name: boardName,
      trial_ends_at: trialEndsAt.toISOString(),
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true, boardSlug: finalSlug };
}
