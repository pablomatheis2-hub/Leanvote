"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Status, Category } from "@/types/database";
import { getAccessStatus } from "@/lib/access";

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

  revalidatePath("/dashboard");
  if (profile?.board_slug) {
    revalidatePath(`/b/${profile.board_slug}`);
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

  if (!title?.trim()) {
    return { error: "Title is required" };
  }

  if (!category) {
    return { error: "Category is required" };
  }

  // Create the roadmap item (admin creates for their own board)
  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    board_owner_id: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    category,
    status: status || "Planned",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/roadmap");
  if (profile?.board_slug) {
    revalidatePath(`/b/${profile.board_slug}`);
  }
  return { success: true };
}

export async function updateBoardSettings(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const boardName = formData.get("boardName") as string;
  const boardSlug = formData.get("boardSlug") as string;

  if (!boardName?.trim()) {
    return { error: "Board name is required" };
  }

  if (!boardSlug?.trim()) {
    return { error: "Board URL is required" };
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(boardSlug)) {
    return { error: "Board URL can only contain lowercase letters, numbers, and hyphens" };
  }

  // Check if slug is already taken by another user
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("board_slug", boardSlug)
    .neq("id", user.id)
    .single();

  if (existingProfile) {
    return { error: "This board URL is already taken" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      board_name: boardName.trim(),
      board_slug: boardSlug.trim(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}
