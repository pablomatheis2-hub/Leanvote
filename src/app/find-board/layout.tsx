import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Feedback Board",
  description:
    "Search for a feedback board by name or company URL. Vote on features, submit feedback, and help shape products you love.",
  alternates: {
    canonical: "/find-board",
  },
  openGraph: {
    title: "Find a Feedback Board - LeanVote",
    description:
      "Search for a feedback board by name or company URL. Vote on features and submit feedback.",
    url: "/find-board",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FindBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
