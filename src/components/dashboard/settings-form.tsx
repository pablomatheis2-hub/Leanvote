"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBoardSettings } from "@/lib/actions/admin";
import type { Profile } from "@/types/database";

interface SettingsFormProps {
  profile: Profile;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateBoardSettings(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="boardName" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Board Name
        </label>
        <Input
          id="boardName"
          name="boardName"
          defaultValue={profile.board_name || ""}
          placeholder="My Product Feedback"
          className="h-10"
        />
        <p className="text-xs text-zinc-500 mt-1">
          This appears at the top of your public feedback board
        </p>
      </div>

      <div>
        <label htmlFor="boardSlug" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Board URL
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">
            {process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/b/
          </span>
          <Input
            id="boardSlug"
            name="boardSlug"
            defaultValue={profile.board_slug || ""}
            placeholder="my-product"
            className="h-10 flex-1"
          />
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Only lowercase letters, numbers, and hyphens allowed
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {success && (
        <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
          Settings saved successfully!
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="bg-zinc-900 hover:bg-zinc-800 text-white"
      >
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
