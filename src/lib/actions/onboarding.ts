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

export async function completeOnboardingAsAdmin(
  companyName: string,
  companyUrl: string | null,
  companyDescription: string | null
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in" };
  }

  if (!companyName?.trim()) {
    return { error: "Company name is required" };
  }

  // Generate board slug from company name
  const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  
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

  // Board name is the company name + Feedback
  const boardName = companyName.trim() + " Feedback";
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  // Normalize company URL for searching
  let normalizedUrl = companyUrl;
  if (normalizedUrl) {
    // Remove protocol and www for consistent storage
    normalizedUrl = normalizedUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      user_type: "admin",
      board_slug: finalSlug,
      board_name: boardName,
      company_name: companyName.trim(),
      company_url: normalizedUrl || null,
      company_description: companyDescription?.trim() || null,
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
