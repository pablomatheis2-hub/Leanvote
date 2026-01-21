"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Category } from "@/types/database";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a post" };
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
    title: title.trim(),
    description: description?.trim() || null,
    category,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
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
