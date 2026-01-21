export type Category = "Feature" | "Bug" | "Integration";
export type Status = "Open" | "Planned" | "In Progress" | "Complete";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
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
