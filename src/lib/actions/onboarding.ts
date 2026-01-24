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

  // Generate slug from company name
  const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  
  // Check for slug uniqueness against PROJECTS table (globally unique)
  let finalSlug = baseSlug;
  let counter = 0;
  
  while (true) {
    const checkSlug = counter > 0 ? `${baseSlug}-${counter}` : baseSlug;
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", checkSlug)
      .single();
    
    if (!existing) {
      finalSlug = checkSlug;
      break;
    }
    counter++;
  }

  // Normalize company URL
  let normalizedUrl = companyUrl;
  if (normalizedUrl) {
    normalizedUrl = normalizedUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  }

  // Set up trial period
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  // First update profile to admin with trial
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      user_type: "admin",
      trial_ends_at: trialEndsAt.toISOString(),
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  // Create the first project (this is the source of truth for company info)
  const { error: projectError } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: companyName.trim(),
      slug: finalSlug,
      company_name: companyName.trim(),
      description: companyDescription?.trim() || null,
      company_url: normalizedUrl || null,
    });

  if (projectError) {
    // Rollback profile changes if project creation fails
    await supabase
      .from("profiles")
      .update({
        user_type: "voter",
        trial_ends_at: null,
        onboarding_completed: false,
      })
      .eq("id", user.id);
    
    return { error: projectError.message };
  }

  revalidatePath("/");
  return { success: true, boardSlug: finalSlug };
}
