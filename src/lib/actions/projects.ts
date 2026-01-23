"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Project } from "@/types/database";

export async function getProjects(): Promise<{ projects: Project[]; error: string | null }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { projects: [], error: "You must be logged in" };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    return { projects: [], error: error.message };
  }

  return { projects: data || [], error: null };
}

export async function getProject(projectId: string): Promise<{ project: Project | null; error: string | null }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { project: null, error: "You must be logged in" };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  if (error) {
    return { project: null, error: error.message };
  }

  return { project: data, error: null };
}

export async function getProjectBySlug(slug: string): Promise<{ project: Project | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return { project: null, error: error.message };
  }

  return { project: data, error: null };
}

export async function createProject(
  name: string,
  description?: string | null,
  companyUrl?: string | null
): Promise<{ project: Project | null; error: string | null }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { project: null, error: "You must be logged in" };
  }

  // Check project limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("project_limit, has_lifetime_access, subscription_status, trial_ends_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { project: null, error: "Profile not found" };
  }

  // Check access
  const now = new Date();
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const hasAccess = profile.has_lifetime_access || 
    profile.subscription_status === "active" || 
    profile.subscription_status === "trialing" ||
    (trialEndsAt && trialEndsAt > now);

  if (!hasAccess) {
    return { project: null, error: "You need an active subscription to create projects" };
  }

  // Count existing projects
  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const projectCount = count || 0;
  const projectLimit = profile.project_limit || 1;

  if (projectCount >= projectLimit) {
    return { project: null, error: `You've reached your project limit (${projectLimit}). Upgrade to add more projects.` };
  }

  // Generate slug from name (globally unique)
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  
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

  const isFirstProject = projectCount === 0;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: name.trim(),
      slug: finalSlug,
      company_name: name.trim(),
      description: description?.trim() || null,
      company_url: normalizedUrl || null,
      is_default: isFirstProject,
    })
    .select()
    .single();

  if (error) {
    return { project: null, error: error.message };
  }

  // The trigger will automatically sync board_slug if this is the default project

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { project: data, error: null };
}

export async function updateProject(
  projectId: string,
  updates: { 
    name?: string; 
    company_name?: string;
    description?: string | null; 
    company_url?: string | null 
  }
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Normalize company URL if provided
  let normalizedUrl = updates.company_url;
  if (normalizedUrl) {
    normalizedUrl = normalizedUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  }

  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name.trim();
  if (updates.company_name !== undefined) updateData.company_name = updates.company_name.trim();
  if (updates.description !== undefined) updateData.description = updates.description?.trim() || null;
  if (updates.company_url !== undefined) updateData.company_url = normalizedUrl || null;

  const { error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Trigger will sync to profile if this is the default project

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: true, error: null };
}

export async function deleteProject(projectId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Check if it's the default project
  const { data: project } = await supabase
    .from("projects")
    .select("is_default")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  if (!project) {
    return { success: false, error: "Project not found" };
  }

  if (project.is_default) {
    return { success: false, error: "Cannot delete the default project. Set another project as default first." };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: true, error: null };
}

export async function setDefaultProject(projectId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Get the project to verify ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id, slug, name")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  if (!project) {
    return { success: false, error: "Project not found" };
  }

  // Unset current default
  await supabase
    .from("projects")
    .update({ is_default: false })
    .eq("owner_id", user.id)
    .eq("is_default", true);

  // Set new default (trigger will sync to profile)
  const { error } = await supabase
    .from("projects")
    .update({ is_default: true })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: true, error: null };
}
