"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Search, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FindBoardPage() {
  const router = useRouter();
  const [boardUrl, setBoardUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const query = boardUrl.trim();
    
    if (!query) {
      setError("Please enter a board name, company URL, or website");
      return;
    }

    setLoading(true);

    try {
      // Check if board exists - API handles slug, company URL, and website matching
      const response = await fetch(`/api/board-exists?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.exists && data.slug) {
        router.push(`/b/${data.slug}`);
      } else {
        setError(`No feedback board found for "${query}". Please check the name or URL and try again.`);
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-orange-50/30">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f97352] flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-zinc-900">LeanVote</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#f97352]/10 flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-[#f97352]" />
          </div>
          <h1 className="text-3xl font-semibold text-zinc-900 mb-3">
            Find a Feedback Board
          </h1>
          <p className="text-lg text-zinc-500">
            Enter the board URL or name to start voting and submitting feedback
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              value={boardUrl}
              onChange={(e) => {
                setBoardUrl(e.target.value);
                setError(null);
              }}
              placeholder="e.g., acme or acme.com"
              className="h-14 pl-5 pr-14 text-lg border-zinc-200 focus:border-[#f97352] focus:ring-[#f97352]/20"
            />
            <Button
              type="submit"
              disabled={loading || !boardUrl.trim()}
              className="absolute right-2 top-2 h-10 w-10 p-0 bg-[#f97352] hover:bg-[#e8634a] text-white"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </form>

        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-400">
            Want to create your own feedback board?{" "}
            <Link href="/upgrade" className="text-[#f97352] font-medium hover:underline">
              Upgrade to Admin
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
