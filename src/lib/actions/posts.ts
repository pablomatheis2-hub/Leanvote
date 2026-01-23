"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Category } from "@/types/database";
import { getAccessStatus } from "@/lib/access";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a post" };
  }

  // Check if user has active access
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const accessStatus = getAccessStatus(profile);
  if (!accessStatus.hasAccess) {
    return { error: "Your trial has expired. Please upgrade to continue creating posts." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as Category;

  if (!title?.trim()) {
    return { error: "Title is required" };
  }

  if (!category) {
    return { error: "Category is required" };
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    board_owner_id: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    category,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/b/${profile?.board_slug}`);
  return { success: true };
}

export async function submitFeedback(boardOwnerId: string, formData: FormData, projectId?: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to submit feedback" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as Category;

  if (!title?.trim()) {
    return { error: "Title is required" };
  }

  if (!category) {
    return { error: "Category is required" };
  }

  // Get board owner's slug for revalidation
  const { data: boardOwner } = await supabase
    .from("profiles")
    .select("board_slug")
    .eq("id", boardOwnerId)
    .single();

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    board_owner_id: boardOwnerId,
    project_id: projectId || null,
    title: title.trim(),
    description: description?.trim() || null,
    category,
  });

  if (error) {
    return { error: error.message };
  }

  if (boardOwner?.board_slug) {
    revalidatePath(`/b/${boardOwner.board_slug}`);
  }
  return { success: true };
}

export async function toggleVote(postId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to vote" };
  }

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  if (existingVote) {
    // Remove vote
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);

    if (error) {
      return { error: error.message };
    }
    
    revalidatePath("/");
    return { voted: false };
  } else {
    // Add vote
    const { error } = await supabase.from("votes").insert({
      user_id: user.id,
      post_id: postId,
    });

    if (error) {
      return { error: error.message };
    }
    
    revalidatePath("/");
    return { voted: true };
  }
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to delete a post" };
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("board_owner_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
