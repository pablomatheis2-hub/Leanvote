"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { KanbanCard } from "./kanban-card";
import { Button } from "@/components/ui/button";
import type { PostWithDetails, Status } from "@/types/database";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: Status;
  posts: PostWithDetails[];
  onAddCard?: () => void;
}

const columnConfig: Record<Status, { title: string; color: string; bg: string; border: string }> = {
  Open: { title: "Open", color: "text-zinc-600", bg: "bg-zinc-50", border: "border-zinc-200" },
  Planned: { title: "Planned", color: "text-amber-700", bg: "bg-amber-50/50", border: "border-amber-200" },
  "In Progress": { title: "In Progress", color: "text-blue-700", bg: "bg-blue-50/50", border: "border-blue-200" },
  Complete: { title: "Complete", color: "text-green-700", bg: "bg-green-50/50", border: "border-green-200" },
};

export function KanbanColumn({ status, posts, onAddCard }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const config = columnConfig[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border-2 transition-colors min-h-[500px]",
        config.bg,
        isOver ? "border-zinc-400 bg-zinc-100/50" : config.border
      )}
    >
      <div className="p-4 border-b border-zinc-200/50">
        <div className="flex items-center justify-between">
          <h3 className={cn("font-semibold", config.color)}>{config.title}</h3>
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            config.bg,
            config.color
          )}>
            {posts.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {posts.map((post) => <KanbanCard key={post.id} post={post} />)}
        
        {/* Add Card button */}
        {onAddCard && (
          <Button
            variant="ghost"
            onClick={onAddCard}
            className="w-full h-10 border-2 border-dashed border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-600 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </Button>
        )}
      </div>
    </div>
  );
}
