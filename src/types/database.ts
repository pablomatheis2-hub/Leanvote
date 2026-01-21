export type Category = "Feature" | "Bug" | "Integration";
export type Status = "Open" | "Planned" | "In Progress" | "Complete";

export type UserType = "voter" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType;
  board_slug: string | null;
  board_name: string | null;
  trial_ends_at: string | null;
  has_lifetime_access: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  board_owner_id: string;
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

export interface PostWithDetails extends Post {
  author_name: string | null;
  author_avatar: string | null;
  vote_count: number;
}

export interface Purchase {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  plan_type: "lifetime";
  status: "active" | "inactive" | "refunded";
  amount: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AccessStatus {
  hasAccess: boolean;
  isInTrial: boolean;
  hasLifetimeAccess: boolean;
  trialEndsAt: Date | null;
  daysRemaining: number | null;
}
