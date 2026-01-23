"use client";

import { useState, useEffect } from "react";
import { User, FolderOpen, Settings, Code2, CreditCard, Crown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccessStatus } from "@/types/database";

interface Section {
  id: string;
  label: string;
}

interface SettingsNavProps {
  sections: Section[];
  accessStatus: AccessStatus;
}

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  profile: User,
  projects: FolderOpen,
  board: Settings,
  widget: Code2,
};

export function SettingsNav({ sections, accessStatus }: SettingsNavProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside className="hidden lg:block w-48 flex-shrink-0">
      <nav className="sticky top-24 space-y-1">
        {sections.map((section) => {
          const Icon = sectionIcons[section.id] || Settings;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{section.label}</span>
              {section.id === "projects" && (
                <>
                  {accessStatus.hasActiveSubscription ? (
                    <Crown className="w-3 h-3 text-primary ml-auto flex-shrink-0" />
                  ) : accessStatus.isInTrial ? (
                    <Clock className="w-3 h-3 text-amber-500 ml-auto flex-shrink-0" />
                  ) : null}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick subscription status on sidebar */}
      {!accessStatus.hasActiveSubscription && !accessStatus.hasLifetimeAccess && (
        <div className="mt-6 p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {accessStatus.isInTrial ? "Free Trial" : "Upgrade"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {accessStatus.isInTrial 
              ? `${accessStatus.daysRemaining} days left`
              : "Subscribe to continue"
            }
          </p>
          <button
            onClick={() => scrollToSection("projects")}
            className="mt-2 text-xs font-medium text-primary hover:text-primary/80"
          >
            View plans →
          </button>
        </div>
      )}
    </aside>
  );
}
