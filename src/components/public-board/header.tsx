"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const slug = boardOwner.board_slug;
  
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0].toUpperCase() || "?";

  const navItems = [
    { href: `/b/${slug}`, label: "Feedback" },
    { href: `/b/${slug}/roadmap`, label: "Roadmap" },
    { href: `/b/${slug}/changelog`, label: "Changelog" },
  ];

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={`/b/${slug}`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f97352] flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-zinc-900">
              {boardOwner.company_name || boardOwner.board_name || "Feedback"}
            </span>
          </Link>
          
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="bg-[#fff5f2] text-[#f97352] text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-0.5 leading-none">
                  {profile?.full_name && (
                    <p className="font-medium text-sm text-zinc-900">{profile.full_name}</p>
                  )}
                  <p className="text-xs text-zinc-500">{user.email}</p>
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
            <Button className="bg-[#f97352] hover:bg-[#e8634a] text-white">
              Sign in to vote
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
