"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Building2, ExternalLink, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BoardSwitcherProps {
  currentBoardName: string;
  currentSlug: string;
}

interface SearchResult {
  id: string;
  name: string;
  companyName: string | null;
  companyUrl: string | null;
  projectSlug: string;
  boardSlug: string;
}

export function BoardSwitcher({ currentBoardName, currentSlug }: BoardSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setResults([]);
        setError(null);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for autocomplete
  const searchBoards = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/search-boards?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setError(null);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
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
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        navigateToBoard(results[selectedIndex]);
      } else if (results.length > 0) {
        navigateToBoard(results[0]);
      } else if (searchQuery.trim()) {
        handleDirectSearch();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
      setResults([]);
    }
  };

  const navigateToBoard = (result: SearchResult) => {
    router.push(`/b/${result.boardSlug}`);
    setIsOpen(false);
    setSearchQuery("");
    setResults([]);
  };

  // Fallback direct search for exact matches
  const handleDirectSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/board-exists?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.exists && data.slug) {
        router.push(`/b/${data.slug}`);
        setIsOpen(false);
        setSearchQuery("");
        setResults([]);
      } else {
        setError("No board found");
      }
    } catch {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      navigateToBoard(results[selectedIndex]);
    } else if (results.length > 0) {
      navigateToBoard(results[0]);
    } else {
      handleDirectSearch();
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
      >
        <Building2 className="w-4 h-4" />
        <span className="max-w-[120px] truncate">{currentBoardName}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden z-50">
          <div className="p-3 border-b border-zinc-100">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
              Switch Board
            </p>
            <form onSubmit={handleSubmit}>
              <div className="relative">
                {loading ? (
                  <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                )}
                <Input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search by name or URL..."
                  className="pl-9 h-9 text-sm"
                  autoFocus
                />
              </div>
            </form>
            
            {/* Autocomplete Results */}
            {results.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => navigateToBoard(result)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors",
                      selectedIndex === index 
                        ? "bg-[#f97352]/10 text-zinc-900" 
                        : "hover:bg-zinc-50 text-zinc-700"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.companyName || result.name}
                      </p>
                      {result.companyUrl && (
                        <p className="text-xs text-zinc-400 truncate flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {result.companyUrl}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* No results message */}
            {searchQuery.trim() && !loading && results.length === 0 && (
              <p className="text-xs text-zinc-400 mt-2 px-1">
                No matching boards found. Press Enter to search.
              </p>
            )}
            
            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
          </div>

          <div className="p-2">
            <div className="text-xs text-zinc-400 px-2 py-1.5">Current board</div>
            <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-[#f97352]/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#f97352]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{currentBoardName}</p>
                <p className="text-xs text-zinc-400">leanvote.com/b/{currentSlug}</p>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-zinc-100 bg-zinc-50">
            <p className="text-xs text-zinc-500">
              Start typing to see matching boards
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
