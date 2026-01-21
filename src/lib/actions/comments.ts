"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CommentWithAuthor } from "@/types/database";

export async function getComments(postId: string): Promise<CommentWithAuthor[]> {
  const supabase = await createClient();

  // First get the post to know who the board owner is
  const { data: post } = await supabase
    .from("posts")
    .select("board_owner_id")
    .eq("id", postId)
    .single();

  if (!post) {
    return [];
  }

  const { data: comments, error } = await supabase
    .from("comments")
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return (comments || []).map((comment) => ({
    ...comment,
    author_name: comment.profiles?.full_name || null,
    author_avatar: comment.profiles?.avatar_url || null,
    is_board_owner: comment.user_id === post.board_owner_id,
  }));
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to comment" };
  }

  if (!content?.trim()) {
    return { error: "Comment cannot be empty" };
  }

  // Get the post
  const { data: post } = await supabase
    .from("posts")
    .select("id, board_owner_id")
    .eq("id", postId)
    .single();

  if (!post) {
    return { error: "Post not found" };
  }

  // Get commenter's profile for returning the comment
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: newComment, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Get board slug for revalidation
  const { data: boardOwner } = await supabase
    .from("profiles")
    .select("board_slug")
    .eq("id", post.board_owner_id)
    .single();

  if (boardOwner?.board_slug) {
    revalidatePath(`/b/${boardOwner.board_slug}/post/${postId}`);
  }

  return {
    success: true,
    comment: {
      ...newComment,
      author_name: profile?.full_name || null,
      author_avatar: profile?.avatar_url || null,
      is_board_owner: user.id === post.board_owner_id,
    } as CommentWithAuthor,
  };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to delete a comment" };
  }

  // Get the comment to verify ownership
  const { data: comment } = await supabase
    .from("comments")
    .select("id, user_id, post_id")
    .eq("id", commentId)
    .single();

  if (!comment) {
    return { error: "Comment not found" };
  }

  // Get the post to check board ownership
  const { data: post } = await supabase
    .from("posts")
    .select("board_owner_id")
    .eq("id", comment.post_id)
    .single();

  if (!post) {
    return { error: "Post not found" };
  }

  const isOwner = comment.user_id === user.id;
  const isBoardOwner = post.board_owner_id === user.id;

  if (!isOwner && !isBoardOwner) {
    return { error: "You don't have permission to delete this comment" };
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    return { error: error.message };
  }

  // Get board slug for revalidation
  const { data: boardOwner } = await supabase
    .from("profiles")
    .select("board_slug")
    .eq("id", post.board_owner_id)
    .single();

  if (boardOwner?.board_slug) {
    revalidatePath(`/b/${boardOwner.board_slug}/post/${comment.post_id}`);
  }

  return { success: true };
}
