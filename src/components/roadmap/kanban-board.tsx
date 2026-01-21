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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePostStatus, createRoadmapItem } from "@/lib/actions/admin";
import type { PostWithDetails, Status, Category } from "@/types/database";

interface KanbanBoardProps {
  initialPosts: PostWithDetails[];
}

const ROADMAP_STATUSES: Status[] = ["Planned", "In Progress", "Complete"];

export function KanbanBoard({ initialPosts }: KanbanBoardProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [activePost, setActivePost] = useState<PostWithDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>("Planned");
  const [category, setCategory] = useState<Category | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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

  const handleAddCard = (status: Status) => {
    setSelectedStatus(status);
    setCategory("");
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    if (!category) {
      setError("Category is required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    formData.set("category", category);
    formData.set("status", selectedStatus);
    
    const result = await createRoadmapItem(formData);
    
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
    } else {
      // Add the new post to local state for instant display
      if (result.post) {
        setPosts((current) => [result.post as PostWithDetails, ...current]);
      }
      setDialogOpen(false);
      setCategory("");
    }
  };

  return (
    <>
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
              onAddCard={() => handleAddCard(status)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-zinc-900">
              Add Roadmap Item
            </DialogTitle>
            <DialogDescription>
              Add a new item to your roadmap in the &quot;{selectedStatus}&quot; column.
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-5 mt-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-zinc-700">
                Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Short, descriptive title"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-zinc-700">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide more details..."
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="Bug">Bug Fix</SelectItem>
                  <SelectItem value="Integration">Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !category}
                className="bg-[#f97352] hover:bg-[#e8634a] text-white min-w-[100px]"
              >
                {loading ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
