"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Search, ArrowRight, AlertCircle, Building2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  companyName: string | null;
  companyUrl: string | null;
  projectSlug: string;
  boardSlug: string;
}

export default function FindBoardPage() {
  const router = useRouter();
  const [boardUrl, setBoardUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for autocomplete
  const searchBoards = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/search-boards?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
      setSelectedIndex(-1);
      setShowResults(true);
    } catch {
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setBoardUrl(value);
    setError(null);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setSearchLoading(false);
      setShowResults(false);
      return;
    }

    setSearchLoading(true);
    
    // Debounce search by 200ms
    searchTimeoutRef.current = setTimeout(() => {
      searchBoards(value);
    }, 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        navigateToBoard(results[selectedIndex]);
      }
      // If no selection, let the form submit normally
    } else if (e.key === "Escape") {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  const navigateToBoard = (result: SearchResult) => {
    router.push(`/b/${result.boardSlug}`);
    setShowResults(false);
    setResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // If a result is selected, navigate to it
    if (selectedIndex >= 0 && results[selectedIndex]) {
      navigateToBoard(results[selectedIndex]);
      return;
    }
    
    const query = boardUrl.trim();
    
    if (!query) {
      setError("Please enter a board name, company URL, or website");
      return;
    }

    setLoading(true);
    setShowResults(false);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
            <div className="relative">
              {searchLoading ? (
                <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 animate-spin z-10" />
              ) : (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 z-10" />
              )}
              <Input
                ref={inputRef}
                type="text"
                value={boardUrl}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => results.length > 0 && setShowResults(true)}
                placeholder="e.g., acme or acme.com"
                className="h-14 pl-12 pr-14 text-lg border-zinc-200 focus:border-[#f97352] focus:ring-[#f97352]/20"
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
            
            {/* Autocomplete Results Dropdown */}
            {showResults && results.length > 0 && (
              <div 
                ref={resultsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden z-50"
              >
                <div className="p-2 max-h-72 overflow-y-auto">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => navigateToBoard(result)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
                        selectedIndex === index 
                          ? "bg-[#f97352]/10 text-zinc-900" 
                          : "hover:bg-zinc-50 text-zinc-700"
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {result.companyName || result.name}
                        </p>
                        {result.companyUrl && (
                          <p className="text-xs text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                            <ExternalLink className="w-3 h-3" />
                            {result.companyUrl}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100">
                  <p className="text-xs text-zinc-500">
                    Use ↑↓ to navigate, Enter to select
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Not sure which board to visit?{" "}
          <Link href="/b/leanvote" className="text-[#f97352] font-medium hover:underline">
            Check out our official board
          </Link>
        </p>
      </main>
    </div>
  );
}
