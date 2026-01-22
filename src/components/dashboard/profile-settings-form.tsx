"use client";

import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile, removeAvatar } from "@/lib/actions/admin";
import type { Profile } from "@/types/database";

interface ProfileSettingsFormProps {
  profile: Profile;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    setError(null);

    const result = await removeAvatar();

    if (result.error) {
      setError(result.error);
    } else {
      setPreviewUrl(null);
      setSelectedFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    // Add the selected file to formData
    if (selectedFile) {
      formData.set("avatar", selectedFile);
    }

    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setSelectedFile(null); // Clear selected file after successful upload
      if (result.avatarUrl) {
        setPreviewUrl(result.avatarUrl);
      }
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-3">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-2 border-zinc-200">
              <AvatarImage src={previewUrl || undefined} />
              <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {previewUrl ? "Change Photo" : "Upload Photo"}
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveAvatar}
                disabled={loading}
                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          JPG, PNG, WebP, or GIF. Max 2MB.
        </p>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Display Name
        </label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={profile.full_name || ""}
          placeholder="Your name"
          className="h-10"
        />
        <p className="text-xs text-zinc-500 mt-1">
          This is how your name appears when you comment on posts
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {success && (
        <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
          Profile updated successfully!
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="bg-zinc-900 hover:bg-zinc-800 text-white"
      >
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
