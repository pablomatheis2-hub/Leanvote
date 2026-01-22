import type { Metadata, Viewport } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leanvote.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LeanVote - Customer Feedback Board & Feature Voting Tool",
    template: "%s | LeanVote",
  },
  description:
    "Collect customer feedback, prioritize feature requests, and build what matters. Simple feedback boards with voting, public roadmaps, and changelogs. Start free, $49 lifetime access.",
  keywords: [
    "feedback board",
    "customer feedback",
    "feature voting",
    "feature request tool",
    "product feedback",
    "user feedback",
    "roadmap tool",
    "public roadmap",
    "changelog",
    "user voting",
    "feedback widget",
    "product management",
    "customer suggestions",
    "bug tracking",
    "feature prioritization",
    "SaaS feedback",
    "startup feedback tool",
  ],
  authors: [{ name: "LeanVote" }],
  creator: "LeanVote",
  publisher: "LeanVote",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "LeanVote",
    title: "LeanVote - Customer Feedback Board & Feature Voting Tool",
    description:
      "Collect customer feedback, prioritize feature requests, and build what matters. Simple feedback boards with voting, public roadmaps, and changelogs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LeanVote - Customer Feedback Board",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeanVote - Customer Feedback Board & Feature Voting Tool",
    description:
      "Collect customer feedback, prioritize feature requests, and build what matters. Start free, $49 lifetime access.",
    images: ["/og-image.png"],
    creator: "@leanvote",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  manifest: "/manifest.json",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "LeanVote",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.svg`,
        width: 32,
        height: 32,
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "LeanVote",
      description:
        "Collect customer feedback, prioritize feature requests, and build what matters.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/find-board?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "LeanVote",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "49",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "500",
        bestRating: "5",
        worstRating: "1",
      },
      description:
        "Customer feedback board software with voting, public roadmaps, and changelogs. Start with a 7-day free trial.",
      featureList: [
        "Customer feedback collection",
        "Feature voting system",
        "Public product roadmap",
        "Changelog generation",
        "Embeddable widget",
        "Custom board URLs",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} ${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
