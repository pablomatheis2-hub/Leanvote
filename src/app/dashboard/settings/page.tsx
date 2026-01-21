import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { WidgetSettings } from "@/components/dashboard/widget-settings";
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

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await getProfile(user.id);
  
  if (!profile) return null;

  const accessStatus = getAccessStatus(profile);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Settings
        </h1>
        <p className="text-zinc-500 mt-1">
          Manage your board settings and subscription
        </p>
      </div>

      <div className="space-y-8">
        {/* Board Settings */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Board Settings
          </h2>
          <SettingsForm profile={profile} />
        </div>

        {/* Widget Embed */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Embed Widget
          </h2>
          <WidgetSettings profile={profile} />
        </div>

        {/* Subscription */}
        <SubscriptionCard accessStatus={accessStatus} />
      </div>
    </div>
  );
}
