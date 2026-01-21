"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, LayoutDashboard, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeOnboardingAsAdmin } from "@/lib/actions/onboarding";

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await completeOnboardingAsAdmin();
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const features = [
    "Your own feedback board",
    "Shareable public URL",
    "Roadmap management",
    "Changelog page",
    "Unlimited posts",
    "7-day free trial",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-orange-50/30 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#f97352] flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-2xl text-zinc-900">LeanVote</span>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-8">
          <div className="w-14 h-14 rounded-xl bg-[#fff5f2] flex items-center justify-center mb-6">
            <LayoutDashboard className="w-7 h-7 text-[#f97352]" />
          </div>
          
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
            Create Your Feedback Board
          </h1>
          <p className="text-zinc-500 mb-6">
            Upgrade to start collecting feedback and votes from your users.
          </p>

          <ul className="space-y-3 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-zinc-700">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-700 text-sm mb-6">
            <Zap className="w-4 h-4" />
            <span>Start with a <strong>7-day free trial</strong>, then $49 lifetime access</span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full h-12 bg-[#f97352] hover:bg-[#e8634a] text-white font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating your board...
              </span>
            ) : (
              "Start Free Trial"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
