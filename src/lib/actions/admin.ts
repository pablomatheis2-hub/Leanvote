"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Status, Category } from "@/types/database";
import { getAccessStatus } from "@/lib/access";

async function getProjectSlugsForUser(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, userId: string): Promise<string[]> {
  const { data: projects } = await supabase
    .from("projects")
    .select("slug")
    .eq("owner_id", userId);
  
  return (projects || []).map(p => p.slug);
}

export async function updatePostStatus(postId: string, newStatus: Status) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check access
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const accessStatus = getAccessStatus(profile);
  if (!accessStatus.hasAccess) {
    return { error: "Your trial has expired. Please upgrade to continue." };
  }

  // Update the post status (only if user owns the board)
  const { error } = await supabase
    .from("posts")
    .update({ status: newStatus })
    .eq("id", postId)
    .eq("board_owner_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate all user's project pages
  const projectSlugs = await getProjectSlugsForUser(supabase, user.id);
  revalidatePath("/dashboard");
  for (const slug of projectSlugs) {
    revalidatePath(`/b/${slug}`);
  }
  
  return { success: true };
}

export async function promoteToRoadmap(
  postId: string,
  newStatus: Status,
  title: string,
  description: string | null
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check access
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const accessStatus = getAccessStatus(profile);
  if (!accessStatus.hasAccess) {
    return { error: "Your trial has expired. Please upgrade to continue." };
  }

  if (!title?.trim()) {
    return { error: "Title is required" };
  }

  // Update the post with new status, title, and description
  const { error } = await supabase
    .from("posts")
    .update({
      status: newStatus,
      title: title.trim(),
      description: description?.trim() || null,
    })
    .eq("id", postId)
    .eq("board_owner_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate all user's project pages
  const projectSlugs = await getProjectSlugsForUser(supabase, user.id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/roadmap");
  for (const slug of projectSlugs) {
    revalidatePath(`/b/${slug}`);
    revalidatePath(`/b/${slug}/roadmap`);
  }
  
  return { success: true };
}

export async function createRoadmapItem(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check access
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const accessStatus = getAccessStatus(profile);
  if (!accessStatus.hasAccess) {
    return { error: "Your trial has expired. Please upgrade to continue." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as Category;
  const status = formData.get("status") as Status;
  const projectId = formData.get("projectId") as string | null;

  if (!title?.trim()) {
    return { error: "Title is required" };
  }

  if (!category) {
    return { error: "Category is required" };
  }

  // Create the roadmap item (admin creates for their own board)
  const { data: newPost, error } = await supabase.from("posts").insert({
    user_id: user.id,
    board_owner_id: user.id,
    project_id: projectId || null,
    title: title.trim(),
    description: description?.trim() || null,
    category,
    status: status || "Planned",
  }).select(`
    *,
    profiles:user_id (
      full_name,
      avatar_url
    ),
    votes (
      id
    )
  `).single();

  if (error) {
    return { error: error.message };
  }

  // Revalidate dashboard and project pages
  const projectSlugs = await getProjectSlugsForUser(supabase, user.id);
  revalidatePath("/dashboard/roadmap");
  for (const slug of projectSlugs) {
    revalidatePath(`/b/${slug}`);
  }
  
  // Return the created post with proper formatting
  const formattedPost = {
    ...newPost,
    author_name: newPost.profiles?.full_name || profile?.full_name || null,
    author_avatar: newPost.profiles?.avatar_url || null,
    vote_count: newPost.votes?.length || 0,
  };
  
  return { success: true, post: formattedPost };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const displayName = formData.get("displayName") as string;
  const avatarFile = formData.get("avatar") as File | null;

  if (!displayName?.trim()) {
    return { error: "Display name is required" };
  }

  let avatarUrl: string | null = null;

  // Handle avatar upload if a new file was provided
  if (avatarFile && avatarFile.size > 0) {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(avatarFile.type)) {
      return { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image." };
    }

    // Validate file size (max 2MB)
    if (avatarFile.size > 2 * 1024 * 1024) {
      return { error: "Image size must be less than 2MB" };
    }

    // Generate unique filename in user's folder
    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { error: "Failed to upload image. Please try again." };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    avatarUrl = publicUrl;
  }

  // Build update object
  const updateData: { full_name: string; avatar_url?: string } = {
    full_name: displayName.trim(),
  };

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate paths
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  
  // Revalidate all user's project pages
  const projectSlugs = await getProjectSlugsForUser(supabase, user.id);
  for (const slug of projectSlugs) {
    revalidatePath(`/b/${slug}`);
  }

  return { success: true, avatarUrl };
}

export async function removeAvatar() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  
  return { success: true };
}
