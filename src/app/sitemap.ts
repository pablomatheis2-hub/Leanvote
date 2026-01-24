import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leanvote.com";

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
      url: `${siteUrl}/widget-test`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/find-board`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic board pages from projects table
  let boardPages: MetadataRoute.Sitemap = [];

  try {
    // Use direct supabase client (no cookies needed for public data)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: projects } = await supabase
      .from("projects")
      .select("slug, updated_at");

    if (projects) {
      boardPages = projects.map((project) => ({
        url: `${siteUrl}/b/${project.slug}`,
        lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.6,
      }));

      // Add roadmap pages for each project
      const roadmapPages: MetadataRoute.Sitemap = projects.map((project) => ({
        url: `${siteUrl}/b/${project.slug}/roadmap`,
        lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.5,
      }));

      // Add changelog pages for each project
      const changelogPages: MetadataRoute.Sitemap = projects.map((project) => ({
        url: `${siteUrl}/b/${project.slug}/changelog`,
        lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
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
