import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import { PaywallGate } from "@/components/dashboard/paywall-gate";
import { getAccessStatus } from "@/lib/access";
import type { Profile } from "@/types/database";

async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
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

  const profile = await getProfile(user.id);
  
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
      <DashboardNav user={user} profile={profile} accessStatus={accessStatus} />
      
      {accessStatus.isInTrial && accessStatus.daysRemaining !== null && (
        <TrialBanner daysRemaining={accessStatus.daysRemaining} />
      )}

      {!accessStatus.hasAccess ? (
        <PaywallGate />
      ) : (
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      )}
    </div>
  );
}
