import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in or create an account to vote on features, submit feedback, or create your own customer feedback board. Free for voters, $49 lifetime for board owners.",
  alternates: {
    canonical: "/auth/login",
  },
  openGraph: {
    title: "Sign In to LeanVote",
    description:
      "Sign in or create an account to vote on features, submit feedback, or create your own feedback board.",
    url: "/auth/login",
    type: "website",
  },
  robots: {
    index: false, // Don't index login pages
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
