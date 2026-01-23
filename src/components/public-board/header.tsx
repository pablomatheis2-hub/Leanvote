"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MessageSquare, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BoardSwitcher } from "./board-switcher";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

interface PublicBoardHeaderProps {
  boardOwner: Profile;
  boardName: string;
  user: User | null;
  profile: Profile | null;
}

export function PublicBoardHeader({ boardOwner, boardName, user, profile }: PublicBoardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isWidget = searchParams.get("widget") === "true";
  const slug = boardOwner.board_slug;
  const displayName = boardName || boardOwner.board_name || "Feedback";
  
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0].toUpperCase() || "?";

  // Add widget=true to links when in widget mode
  const getHref = (path: string) => isWidget ? `${path}?widget=true` : path;

  const navItems = [
    { href: `/b/${slug}`, label: "Feedback" },
    { href: `/b/${slug}/roadmap`, label: "Roadmap" },
    { href: `/b/${slug}/changelog`, label: "Changelog" },
  ];

  // Compact header for widget mode
  if (isWidget) {
    return (
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <MessageSquare className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-heading font-semibold text-sm text-foreground">
                {displayName}
              </span>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Link href={`/auth/login?redirect=/b/${slug}?widget=true`}>
              <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href={getHref(`/b/${slug}`)} className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg sm:text-xl text-foreground truncate max-w-[120px] sm:max-w-none">
              {displayName}
            </span>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={getHref(item.href)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block h-6 w-px bg-border" />
          
          <div className="hidden md:block">
            <BoardSwitcher 
              currentBoardName={displayName}
              currentSlug={slug || ""}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs sm:text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5 leading-none">
                    {profile?.full_name && (
                      <p className="font-medium text-sm text-foreground">{profile.full_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {profile?.user_type === "admin" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/upgrade" className="cursor-pointer">
                        Create Your Own Board
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <form action={signOut}>
                    <button type="submit" className="w-full text-left cursor-pointer">
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={`/auth/login?redirect=/b/${slug}`}>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
                Sign in
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={getHref(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-3 border-t border-border pt-3">
            <BoardSwitcher 
              currentBoardName={displayName}
              currentSlug={slug || ""}
            />
          </div>
        </div>
      )}
    </header>
  );
}
