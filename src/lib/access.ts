import type { Profile, AccessStatus, SubscriptionStatus } from "@/types/database";

export function getAccessStatus(profile: Profile | null): AccessStatus {
  if (!profile) {
    return {
      hasAccess: false,
      isInTrial: false,
      hasLifetimeAccess: false,
      hasActiveSubscription: false,
      subscriptionStatus: "none",
      trialEndsAt: null,
      daysRemaining: null,
      projectLimit: 1,
      subscriptionEndsAt: null,
    };
  }

  // Only admins (board owners) need access checks
  // Voters always have "access" to vote - they just can't manage boards
  if (profile.user_type !== "admin") {
    return {
      hasAccess: false, // No admin access
      isInTrial: false,
      hasLifetimeAccess: false,
      hasActiveSubscription: false,
      subscriptionStatus: "none",
      trialEndsAt: null,
      daysRemaining: null,
      projectLimit: 1,
      subscriptionEndsAt: null,
    };
  }

  const now = new Date();
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const subscriptionEndsAt = profile.subscription_current_period_end 
    ? new Date(profile.subscription_current_period_end) 
    : null;
  
  const hasLifetimeAccess = profile.has_lifetime_access;
  const isInTrial = trialEndsAt ? trialEndsAt > now : false;
  const hasActiveSubscription = profile.subscription_status === "active" || profile.subscription_status === "trialing";
  const hasAccess = hasLifetimeAccess || isInTrial || hasActiveSubscription;

  let daysRemaining: number | null = null;
  if (isInTrial && trialEndsAt && !hasActiveSubscription && !hasLifetimeAccess) {
    daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    hasAccess,
    isInTrial: isInTrial && !hasActiveSubscription && !hasLifetimeAccess,
    hasLifetimeAccess,
    hasActiveSubscription,
    subscriptionStatus: profile.subscription_status || "none",
    trialEndsAt,
    daysRemaining,
    projectLimit: profile.project_limit || 1,
    subscriptionEndsAt,
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

export function getSubscriptionPrice(projectCount: number): { base: number; addon: number; total: number } {
  const BASE_PRICE = 9.99;
  const ADDON_PRICE = 4.99;
  const additionalProjects = Math.max(0, projectCount - 1);
  
  return {
    base: BASE_PRICE,
    addon: additionalProjects * ADDON_PRICE,
    total: BASE_PRICE + (additionalProjects * ADDON_PRICE),
  };
}
