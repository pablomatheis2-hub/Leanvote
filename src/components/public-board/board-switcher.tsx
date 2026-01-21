"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BoardSwitcherProps {
  currentBoardName: string;
  currentSlug: string;
}

export function BoardSwitcher({ currentBoardName, currentSlug }: BoardSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setError(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      } else {
        setError("No board found");
      }
    } catch {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-zinc-100">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
              Switch Board
            </p>
            <form onSubmit={handleSearch}>
              <div className="relative">
                {loading ? (
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                )}
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setError(null);
                  }}
                  placeholder="Search by name or URL..."
                  className="pl-9 h-9 text-sm"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </form>
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
              Enter a board name, company name, or website URL to switch boards
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
