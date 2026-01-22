import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeanVote - Customer Feedback Board & Feature Voting Tool",
  description:
    "Collect customer feedback, prioritize feature requests, and build what matters. Simple feedback boards with voting, public roadmaps, and changelogs. Start free, $49 lifetime access.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LeanVote - Customer Feedback Board & Feature Voting Tool",
    description:
      "Collect customer feedback, prioritize feature requests, and build what matters. Simple feedback boards with voting, public roadmaps, and changelogs.",
    url: "/",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
