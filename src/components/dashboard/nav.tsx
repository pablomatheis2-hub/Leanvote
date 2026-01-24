"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MessageSquare, LayoutDashboard, Map, Settings, ExternalLink, BookOpen, Menu, X, ChevronDown, FolderOpen, Check, Crown, History } from "lucide-react";
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
import type { Profile, AccessStatus, Project } from "@/types/database";

interface DashboardNavProps {
  user: User;
  profile: Profile;
  accessStatus: AccessStatus;
  projects?: Project[];
  currentProjectId?: string;
}

export function DashboardNav({ user, profile, accessStatus, projects = [], currentProjectId }: DashboardNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0].toUpperCase() || "?";

  // Get project from URL or use provided currentProjectId
  const projectIdFromUrl = searchParams.get("project");
  const effectiveProjectId = projectIdFromUrl || currentProjectId;
  const currentProject = projects.find(p => p.id === effectiveProjectId) || projects.find(p => p.is_default) || projects[0];

  // Build query string for navigation links
  const projectParam = effectiveProjectId ? `?project=${effectiveProjectId}` : "";

  const navItems = [
    { href: "/dashboard", label: "Feedback", icon: LayoutDashboard },
    { href: "/dashboard/roadmap", label: "Roadmap", icon: Map },
    { href: "/dashboard/changelog", label: "Changelog", icon: History },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href={`/dashboard${projectParam}`} className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg sm:text-xl text-foreground">LeanVote</span>
          </Link>

          {/* Project Switcher - Only show if there are multiple projects */}
          {projects.length > 1 && currentProject && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors">
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="max-w-[120px] truncate">{currentProject.name}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Switch Project
                </div>
                {projects.map((project) => {
                  // If on settings page, redirect to dashboard when switching project
                  // Otherwise stay on current page and update project param
                  const switchHref = pathname === "/dashboard/settings"
                    ? `/dashboard?project=${project.id}`
                    : `${pathname}?project=${project.id}`;
                  return (
                    <DropdownMenuItem key={project.id} asChild>
                      <Link
                        href={switchHref}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">{project.name}</span>
                        {project.id === currentProject.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer text-muted-foreground">
                    Manage Projects
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Always persist project param to maintain context
              const href = `${item.href}${projectParam}`;
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop links */}
          <Link
            href="/docs"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Docs
          </Link>
          {currentProject?.slug && (
            <Link
              href={`/b/${currentProject.slug}`}
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden lg:inline">View Public Board</span>
              <span className="lg:hidden">Board</span>
            </Link>
          )}

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
                  {accessStatus.hasLifetimeAccess ? (
                    <span className="inline-flex items-center text-xs text-emerald-600 font-medium mt-1">
                      ✓ Lifetime Access
                    </span>
                  ) : accessStatus.hasActiveSubscription ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                      <Crown className="w-3 h-3" />
                      Pro ({accessStatus.projectLimit} {accessStatus.projectLimit === 1 ? "project" : "projects"})
                    </span>
                  ) : accessStatus.isInTrial ? (
                    <span className="inline-flex items-center text-xs text-amber-600 font-medium mt-1">
                      ⏰ Trial ({accessStatus.daysRemaining} days left)
                    </span>
                  ) : null}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/settings${projectParam}`} className="cursor-pointer">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={signOut}>
                  <button type="submit" className="w-full text-left cursor-pointer">
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
          {/* Mobile Project Switcher */}
          {projects.length > 1 && currentProject && (
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs text-muted-foreground mb-2">Current Project</p>
              <select
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                value={currentProject.id}
                onChange={(e) => {
                  // If on settings, redirect to dashboard. Otherwise stay on page.
                  const basePath = pathname === "/dashboard/settings" ? "/dashboard" : pathname;
                  const newPath = `${basePath}?project=${e.target.value}`;
                  window.location.href = newPath;
                }}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Always persist project param
              const href = `${item.href}${projectParam}`;
              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 pb-3 border-t border-border pt-3 space-y-1">
            <Link
              href="/docs"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </Link>
            {currentProject?.slug && (
              <Link
                href={`/b/${currentProject.slug}`}
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                <ExternalLink className="w-4 h-4" />
                View Public Board
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
