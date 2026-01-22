import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leanvote.app";

// Force dynamic rendering since this queries the database
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/find-board`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Dynamic board pages
  let boardPages: MetadataRoute.Sitemap = [];

  try {
    // Use direct supabase client (no cookies needed for public data)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: boards } = await supabase
      .from("profiles")
      .select("board_slug, updated_at")
      .not("board_slug", "is", null)
      .not("board_slug", "eq", "");

    if (boards) {
      boardPages = boards.map((board) => ({
        url: `${siteUrl}/b/${board.board_slug}`,
        lastModified: board.updated_at ? new Date(board.updated_at) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.6,
      }));

      // Add roadmap pages for each board
      const roadmapPages: MetadataRoute.Sitemap = boards.map((board) => ({
        url: `${siteUrl}/b/${board.board_slug}/roadmap`,
        lastModified: board.updated_at ? new Date(board.updated_at) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.5,
      }));

      // Add changelog pages for each board
      const changelogPages: MetadataRoute.Sitemap = boards.map((board) => ({
        url: `${siteUrl}/b/${board.board_slug}/changelog`,
        lastModified: board.updated_at ? new Date(board.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));

      boardPages = [...boardPages, ...roadmapPages, ...changelogPages];
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return [...staticPages, ...boardPages];
}
