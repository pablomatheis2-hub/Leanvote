export type Category = "Feature" | "Bug" | "Integration";
export type Status = "Open" | "Planned" | "In Progress" | "Complete";

export type UserType = "voter" | "admin";
export type SubscriptionStatus = "none" | "active" | "past_due" | "canceled" | "trialing";
export type PlanType = "lifetime" | "subscription";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType;
  // Trial and subscription
  trial_ends_at: string | null;
  has_lifetime_access: boolean;
  // Stripe subscription fields
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_current_period_end: string | null;
  project_limit: number;
  // Onboarding
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  company_name: string | null;
  description: string | null;
  company_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithOwner extends Project {
  owner_name: string | null;
  owner_avatar: string | null;
  subscription_status: SubscriptionStatus;
  project_limit: number;
}

export interface Post {
  id: string;
  user_id: string;
  board_owner_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  category: Category;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends Comment {
  author_name: string | null;
  author_avatar: string | null;
  is_board_owner: boolean;
}

export interface PostWithDetails extends Post {
  author_name: string | null;
  author_avatar: string | null;
  vote_count: number;
  // Project info for multi-project support
  project_slug?: string;
  project_name?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_subscription_id: string | null;
  plan_type: PlanType;
  status: "active" | "inactive" | "refunded";
  amount: number | null;
  currency: string;
  project_count: number;
  created_at: string;
  updated_at: string;
}

export interface AccessStatus {
  hasAccess: boolean;
  isInTrial: boolean;
  hasLifetimeAccess: boolean;
  hasActiveSubscription: boolean;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
  daysRemaining: number | null;
  projectLimit: number;
  subscriptionEndsAt: Date | null;
}
