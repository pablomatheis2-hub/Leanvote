import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { WidgetSettings } from "@/components/dashboard/widget-settings";
import { ProjectManager } from "@/components/dashboard/project-manager";
import { SettingsNav } from "@/components/dashboard/settings-nav";
import { getAccessStatus } from "@/lib/access";
import type { Profile, Project } from "@/types/database";

async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
}

async function getProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  return data || [];
}

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile, projects] = await Promise.all([
    getProfile(user.id),
    getProjects(user.id),
  ]);
  
  if (!profile) return null;

  const accessStatus = getAccessStatus(profile);

  const sections = [
    { id: "profile", label: "Profile" },
    { id: "projects", label: "Projects & Billing" },
    { id: "board", label: "Board Settings" },
    { id: "widget", label: "Embed Widget" },
  ];

  return (
    <div className="flex gap-8">
      {/* Sticky Sidebar Navigation */}
      <SettingsNav sections={sections} accessStatus={accessStatus} />

      {/* Main Content */}
      <div className="flex-1 min-w-0 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <section id="profile" className="scroll-mt-24">
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-foreground mb-1">
                Your Profile
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Customize how you appear when commenting on posts
              </p>
              <ProfileSettingsForm profile={profile} />
            </div>
          </section>

          {/* Projects & Billing - Combined Section */}
          <section id="projects" className="scroll-mt-24 space-y-4">
            <ProjectManager projects={projects} accessStatus={accessStatus} />
            <SubscriptionCard accessStatus={accessStatus} />
          </section>

          {/* Board Settings */}
          <section id="board" className="scroll-mt-24">
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Board Settings
              </h2>
              <SettingsForm profile={profile} />
            </div>
          </section>

          {/* Widget Embed */}
          <section id="widget" className="scroll-mt-24">
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Embed Widget
              </h2>
              <WidgetSettings profile={profile} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
