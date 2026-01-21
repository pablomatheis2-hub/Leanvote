"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { updatePostStatus } from "@/lib/actions/admin";
import type { PostWithDetails, Status } from "@/types/database";

interface KanbanBoardProps {
  initialPosts: PostWithDetails[];
}

const ROADMAP_STATUSES: Status[] = ["Planned", "In Progress", "Complete"];

export function KanbanBoard({ initialPosts }: KanbanBoardProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [activePost, setActivePost] = useState<PostWithDetails | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getPostsByStatus = (status: Status) =>
    posts.filter((post) => post.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const post = posts.find((p) => p.id === event.active.id);
    setActivePost(post || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePost(null);

    if (!over) return;

    const postId = active.id as string;
    const newStatus = over.id as Status;
    const post = posts.find((p) => p.id === postId);

    if (!post || post.status === newStatus) return;

    // Optimistic update
    setPosts((current) =>
      current.map((p) =>
        p.id === postId ? { ...p, status: newStatus } : p
      )
    );

    // Server update
    startTransition(async () => {
      const result = await updatePostStatus(postId, newStatus);
      if (result.error) {
        // Revert on error
        setPosts((current) =>
          current.map((p) =>
            p.id === postId ? { ...p, status: post.status } : p
          )
        );
      }
    });
  };

  const totalPosts = posts.length;

  if (totalPosts === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-zinc-900 mb-1">No items on the roadmap</h3>
        <p className="text-zinc-500 text-sm">
          Update post statuses from the feedback board to see them here.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-6">
        {ROADMAP_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            posts={getPostsByStatus(status)}
          />
        ))}
      </div>
      <DragOverlay>
        {activePost && (
          <div className="rotate-3 scale-105">
            <KanbanCard post={activePost} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
