"use client";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Predefined FAQs for the landing page
export const landingPageFAQs: FAQItem[] = [
  {
    question: "What is LeanVote?",
    answer:
      "LeanVote is a customer feedback board tool that lets you collect feature requests, bug reports, and ideas from your users. Users can vote on submissions to help you prioritize what to build next.",
  },
  {
    question: "How much does LeanVote cost?",
    answer:
      "LeanVote offers a 7-day free trial, then costs $49 for lifetime access. There are no monthly fees or subscriptions. Voting and submitting feedback is always free for your users.",
  },
  {
    question: "Can my users vote for free?",
    answer:
      "Yes! Voting and submitting feedback is completely free for all users. Only board owners who want to create and manage their own feedback board need to pay.",
  },
  {
    question: "What features are included?",
    answer:
      "LeanVote includes feedback collection, a voting system, public roadmap, changelog, embeddable widget, custom board URLs, and priority support. All features are included with the lifetime access.",
  },
  {
    question: "Can I embed LeanVote on my website?",
    answer:
      "Yes! LeanVote provides an embeddable widget that you can add to your website with just a few lines of code. It works with any website, including React, Vue, and vanilla JavaScript.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes, LeanVote offers a 7-day free trial with full access to all features. No credit card is required to start your trial.",
  },
];
