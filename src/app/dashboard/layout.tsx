import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import { PaywallGate } from "@/components/dashboard/paywall-gate";
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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  const [profile, projects] = await Promise.all([
    getProfile(user.id),
    getProjects(user.id),
  ]);
  
  if (!profile) {
    redirect("/auth/login");
  }

  // Check if user has completed onboarding
  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  // Check if user is an admin (board owner)
  if (profile.user_type !== "admin") {
    // Voters should not access the dashboard - redirect to upgrade page
    redirect("/upgrade");
  }

  const accessStatus = getAccessStatus(profile);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        user={user} 
        profile={profile} 
        accessStatus={accessStatus} 
        projects={projects}
      />
      
      {accessStatus.isInTrial && accessStatus.daysRemaining !== null && (
        <TrialBanner daysRemaining={accessStatus.daysRemaining} />
      )}

      {!accessStatus.hasAccess ? (
        <PaywallGate />
      ) : (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>
      )}
    </div>
  );
}
