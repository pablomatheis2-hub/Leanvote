import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation - Widget Integration Guide",
  description:
    "Learn how to embed the LeanVote feedback widget on your website. Quick start guide, configuration options, and framework integrations for React, Vue, and vanilla JavaScript.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "LeanVote Documentation - Widget Integration Guide",
    description:
      "Learn how to embed the LeanVote feedback widget on your website. Quick start guide for React, Vue, and vanilla JavaScript.",
    url: "/docs",
    type: "article",
  },
  keywords: [
    "LeanVote widget",
    "feedback widget integration",
    "embed feedback form",
    "React feedback widget",
    "Vue feedback widget",
    "JavaScript feedback widget",
    "customer feedback API",
    "widget documentation",
  ],
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
