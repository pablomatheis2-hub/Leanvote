"use client";

import { useState } from "react";
import { Copy, Check, Code2, ExternalLink, Palette, MapPin } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/types/database";

interface WidgetSettingsProps {
  profile: Profile;
}

const positions = [
  { value: "bottom-right", label: "Bottom Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "top-right", label: "Top Right" },
  { value: "top-left", label: "Top Left" },
];

const presetColors = [
  { value: "#f97352", label: "Coral (Default)" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ec4899", label: "Pink" },
  { value: "#171717", label: "Black" },
];

export function WidgetSettings({ profile }: WidgetSettingsProps) {
  const [position, setPosition] = useState("bottom-right");
  const [primaryColor, setPrimaryColor] = useState("#f97352");
  const [buttonText, setButtonText] = useState("Feedback");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const boardSlug = profile.board_slug || "your-board-slug";
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : "https://leanvote.com";

  const embedCode = `<script src="${baseUrl}/widget.js"></script>
<script>
  LeanVoteWidget.init({
    boardSlug: '${boardSlug}',
    position: '${position}',
    primaryColor: '${primaryColor}',
    buttonText: '${buttonText}'
  });
</script>`;

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Quick Info */}
      <div className="flex items-start gap-4 p-4 bg-[#fff5f2] rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
          <Code2 className="w-5 h-5 text-[#f97352]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-900 mb-1">Embed Widget on Your Site</h3>
          <p className="text-sm text-zinc-600 mb-3">
            Add a feedback button to your website so users can submit feedback, view your roadmap, and see your changelog without leaving your site.
          </p>
          <Link 
            href="/docs" 
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#f97352] hover:text-[#e8634a] transition-colors"
          >
            View full documentation
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Board Slug */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Your Board Slug
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-zinc-100 rounded-lg px-4 py-2.5">
            <span className="text-zinc-500 text-sm">{baseUrl}/b/</span>
            <span className="text-zinc-900 font-mono text-sm font-medium">{boardSlug}</span>
          </div>
          <button
            onClick={() => handleCopy(boardSlug, "slug")}
            className="p-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700 transition-colors"
            title="Copy board slug"
          >
            {copiedField === "slug" ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Customization Options */}
      <div className="grid grid-cols-2 gap-4">
        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-zinc-400" />
            Position
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f97352]/20 focus:border-[#f97352]"
          >
            {positions.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>

        {/* Button Text */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Button Text
          </label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="Feedback"
            className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f97352]/20 focus:border-[#f97352]"
          />
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          <Palette className="w-3.5 h-3.5 inline mr-1.5 text-zinc-400" />
          Primary Color
        </label>
        <div className="flex flex-wrap gap-2">
          {presetColors.map((color) => (
            <button
              key={color.value}
              onClick={() => setPrimaryColor(color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                primaryColor === color.value
                  ? "border-zinc-900 scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border-2 border-zinc-200"
              title="Custom color"
            />
            <span className="text-xs text-zinc-500 font-mono">{primaryColor}</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Button Preview
        </label>
        <div className="bg-zinc-100 rounded-xl p-6 flex items-center justify-center">
          <button
            className="flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-lg hover:scale-105 transition-transform"
            style={{ backgroundColor: primaryColor }}
          >
            <svg 
              className="w-4 h-4" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {buttonText || "Feedback"}
          </button>
        </div>
      </div>

      {/* Embed Code */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-zinc-700">
            Embed Code
          </label>
          <button
            onClick={() => handleCopy(embedCode, "code")}
            className="flex items-center gap-1.5 text-xs font-medium text-[#f97352] hover:text-[#e8634a] transition-colors"
          >
            {copiedField === "code" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy code
              </>
            )}
          </button>
        </div>
        <div className="relative">
          <pre className="bg-zinc-900 text-zinc-100 rounded-xl p-4 overflow-x-auto text-xs leading-relaxed font-mono">
            <code>{embedCode}</code>
          </pre>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Add this code before the closing <code className="px-1 py-0.5 bg-zinc-100 rounded">&lt;/body&gt;</code> tag on your website.
        </p>
      </div>
    </div>
  );
}
