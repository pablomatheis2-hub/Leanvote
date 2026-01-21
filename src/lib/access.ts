import type { Profile, AccessStatus } from "@/types/database";

export function getAccessStatus(profile: Profile | null): AccessStatus {
  if (!profile) {
    return {
      hasAccess: false,
      isInTrial: false,
      hasLifetimeAccess: false,
      trialEndsAt: null,
      daysRemaining: null,
    };
  }

  // Only admins (board owners) need access checks
  // Voters always have "access" to vote - they just can't manage boards
  if (profile.user_type !== "admin") {
    return {
      hasAccess: false, // No admin access
      isInTrial: false,
      hasLifetimeAccess: false,
      trialEndsAt: null,
      daysRemaining: null,
    };
  }

  const now = new Date();
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const hasLifetimeAccess = profile.has_lifetime_access;
  const isInTrial = trialEndsAt ? trialEndsAt > now : false;
  const hasAccess = hasLifetimeAccess || isInTrial;

  let daysRemaining: number | null = null;
  if (isInTrial && trialEndsAt) {
    daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    hasAccess,
    isInTrial,
    hasLifetimeAccess,
    trialEndsAt,
    daysRemaining,
  };
}

export function formatTrialRemaining(daysRemaining: number | null): string {
  if (daysRemaining === null) return "";
  if (daysRemaining <= 0) return "Trial expired";
  if (daysRemaining === 1) return "1 day left";
  return `${daysRemaining} days left`;
}

export function isAdmin(profile: Profile | null): boolean {
  return profile?.user_type === "admin";
}

export function isVoter(profile: Profile | null): boolean {
  return profile?.user_type === "voter";
}
