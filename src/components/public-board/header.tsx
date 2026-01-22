"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
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
  user: User | null;
  profile: Profile | null;
}

export function PublicBoardHeader({ boardOwner, user, profile }: PublicBoardHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isWidget = searchParams.get("widget") === "true";
  const slug = boardOwner.board_slug;
  
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
                {boardOwner.company_name || boardOwner.board_name || "Feedback"}
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
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={getHref(`/b/${slug}`)} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              {boardOwner.company_name || boardOwner.board_name || "Feedback"}
            </span>
          </Link>
          
          <nav className="flex items-center gap-1">
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

          <div className="h-6 w-px bg-border" />
          
          <BoardSwitcher 
            currentBoardName={boardOwner.company_name || boardOwner.board_name || "Feedback"}
            currentSlug={slug || ""}
          />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
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
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign in to vote
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
