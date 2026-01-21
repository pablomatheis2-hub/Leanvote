"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createPost } from "@/lib/actions/posts";
import type { Category } from "@/types/database";

interface CreatePostDialogProps {
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

export function CreatePostDialog({ isLoggedIn, onLoginRequired }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "">("");

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isLoggedIn) {
      onLoginRequired();
      return;
    }
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
      setCategory("");
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    formData.set("category", category);
    const result = await createPost(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setCategory("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-900">
            Submit Feedback
          </DialogTitle>
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
              placeholder="Provide more details about your feedback..."
              className="min-h-[120px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Category</label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Feature">Feature Request</SelectItem>
                <SelectItem value="Bug">Bug Report</SelectItem>
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !category}
              className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[100px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting
                </span>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
