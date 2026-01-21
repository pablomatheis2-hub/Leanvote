"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Status } from "@/types/database";

export async function updatePostStatus(postId: string, newStatus: Status) {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Admin access required" };
  }

  // Update the post status
  const { error } = await supabase
    .from("posts")
    .update({ status: newStatus })
    .eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/roadmap");
  return { success: true };
}
