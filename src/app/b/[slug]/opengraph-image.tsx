import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "Feedback Board";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch project data
  let boardName = "Feedback Board";
  let companyName = "";
  let postCount = 0;

  try {
    const supabase = await createClient();
    
    // Get project by slug
    const { data: project } = await supabase
      .from("projects")
      .select("id, name, company_name, owner_id")
      .eq("slug", slug)
      .single();

    if (project) {
      boardName = project.company_name || project.name || "Feedback Board";
      companyName = project.company_name || "";

      // Get post count for this project
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id);

      postCount = count || 0;
    }
  } catch {
    // Use defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(249,115,82,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(249,115,82,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Main content card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: "24px",
            padding: "60px 80px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
            border: "1px solid #e4e4e7",
            maxWidth: "900px",
          }}
        >
          {/* Company name badge */}
          {companyName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
                padding: "8px 16px",
                background: "#f4f4f5",
                borderRadius: "100px",
                fontSize: "18px",
                color: "#71717a",
              }}
            >
              {companyName}
            </div>
          )}

          {/* Board name */}
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#18181b",
              textAlign: "center",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            {boardName}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "24px",
              color: "#71717a",
              textAlign: "center",
              margin: 0,
              marginBottom: "32px",
            }}
          >
            Share ideas, vote on features, shape the roadmap
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "#fff5f2",
                borderRadius: "12px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f97352"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span style={{ color: "#f97352", fontWeight: 600, fontSize: "18px" }}>
                {postCount} posts
              </span>
            </div>
          </div>
        </div>

        {/* LeanVote branding */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#f97352",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span style={{ color: "#71717a", fontSize: "16px" }}>
            Powered by LeanVote
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
