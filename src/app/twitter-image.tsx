import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "LeanVote - Customer Feedback Board";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)",
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
        {/* Decorative gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(249,115,82,0.3) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(249,115,82,0.2) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "#f97352",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            LeanVote
          </span>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
            margin: 0,
            marginBottom: "24px",
            maxWidth: "900px",
            letterSpacing: "-0.03em",
          }}
        >
          Customer Feedback
          <span style={{ color: "#f97352" }}> Made Simple</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "28px",
            color: "#a1a1aa",
            textAlign: "center",
            margin: 0,
            marginBottom: "48px",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Collect feedback, prioritize features, and build what your users actually want.
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          {["Feature Voting", "Public Roadmap", "Changelog", "Widget"].map((feature) => (
            <div
              key={feature}
              style={{
                background: "rgba(249,115,82,0.15)",
                border: "1px solid rgba(249,115,82,0.3)",
                borderRadius: "100px",
                padding: "12px 24px",
                color: "#f97352",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Bottom price tag */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#71717a",
            fontSize: "20px",
          }}
        >
          <span>7-day free trial</span>
          <span style={{ color: "#52525b" }}>•</span>
          <span style={{ color: "#f97352", fontWeight: 600 }}>$49 lifetime access</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
