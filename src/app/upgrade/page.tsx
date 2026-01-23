"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, ArrowRight, LayoutDashboard, Check, Zap, Building2, Globe, FileText, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboardingAsAdmin } from "@/lib/actions/onboarding";
import { getSubscriptionPrice } from "@/lib/access";

type Step = "info" | "company" | "plan";

interface CompanyInfo {
  companyName: string;
  companyUrl: string;
  companyDescription: string;
}

export default function UpgradePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectCount, setProjectCount] = useState(1);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: "",
    companyUrl: "",
    companyDescription: "",
  });

  const pricing = getSubscriptionPrice(projectCount);

  const handleContinue = () => {
    setStep("company");
  };

  const handleCompanyContinue = () => {
    if (!companyInfo.companyName.trim()) {
      setError("Company name is required");
      return;
    }
    setError(null);
    setStep("plan");
  };

  const handleStartTrial = async () => {
    if (!companyInfo.companyName.trim()) {
      setError("Company name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await completeOnboardingAsAdmin(
        companyInfo.companyName.trim(),
        companyInfo.companyUrl.trim() || null,
        companyInfo.companyDescription.trim() || null
      );
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

  const handleSubscribeNow = async () => {
    if (!companyInfo.companyName.trim()) {
      setError("Company name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First complete onboarding
      const result = await completeOnboardingAsAdmin(
        companyInfo.companyName.trim(),
        companyInfo.companyUrl.trim() || null,
        companyInfo.companyDescription.trim() || null
      );
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Then redirect to Stripe checkout
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          projectCount,
          type: "subscription"
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout");
        setLoading(false);
      }
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

        {step === "info" ? (
          /* Step 1: Features info */
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
              <span>Start with a <strong>7-day free trial</strong>, then $9.99/mo</span>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full h-12 bg-[#f97352] hover:bg-[#e8634a] text-white font-semibold"
            >
              <span className="flex items-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </div>
        ) : step === "company" ? (
          /* Step 2: Company info */
          <div className="bg-white rounded-2xl border border-zinc-200 p-8">
            <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
              Tell us about your company
            </h1>
            <p className="text-zinc-500 mb-6">
              This helps users find your feedback board
            </p>

            <div className="space-y-5 mb-6">
              {/* Company Name */}
              <div className="space-y-2">
                <label htmlFor="companyName" className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Building2 className="w-4 h-4 text-zinc-400" />
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyInfo.companyName}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                  placeholder="Acme Inc."
                  className="h-12"
                  required
                />
              </div>

              {/* Company URL */}
              <div className="space-y-2">
                <label htmlFor="companyUrl" className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  Company Website
                </label>
                <Input
                  id="companyUrl"
                  type="url"
                  value={companyInfo.companyUrl}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companyUrl: e.target.value })}
                  placeholder="https://acme.com"
                  className="h-12"
                />
                <p className="text-xs text-zinc-400">
                  Users can search for your board using your website URL
                </p>
              </div>

              {/* Company Description */}
              <div className="space-y-2">
                <label htmlFor="companyDescription" className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  Description
                </label>
                <Textarea
                  id="companyDescription"
                  value={companyInfo.companyDescription}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companyDescription: e.target.value })}
                  placeholder="A brief description of your company or product..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setStep("info")}
                variant="outline"
                disabled={loading}
                className="h-12 px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleCompanyContinue}
                disabled={!companyInfo.companyName.trim() || loading}
                className="flex-1 h-12 bg-[#f97352] hover:bg-[#e8634a] text-white font-semibold"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-2 h-2 rounded-full bg-[#f97352]" />
              <div className="w-2 h-2 rounded-full bg-[#f97352]" />
              <div className="w-2 h-2 rounded-full bg-zinc-300" />
            </div>
          </div>
        ) : (
          /* Step 3: Plan selection */
          <div className="bg-white rounded-2xl border border-zinc-200 p-8">
            <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
              Choose your plan
            </h1>
            <p className="text-zinc-500 mb-6">
              Start free or subscribe now
            </p>

            {/* Project counter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 mb-3">
                How many projects do you need?
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setProjectCount(Math.max(1, projectCount - 1))}
                  disabled={projectCount <= 1}
                  className="w-10 h-10 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <span className="text-4xl font-bold text-zinc-900">{projectCount}</span>
                  <p className="text-sm text-zinc-500">{projectCount === 1 ? "project" : "projects"}</p>
                </div>
                <button
                  onClick={() => setProjectCount(projectCount + 1)}
                  className="w-10 h-10 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-zinc-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Base plan (1 project)</span>
                  <span className="text-zinc-900 font-medium">${pricing.base.toFixed(2)}/mo</span>
                </div>
                {projectCount > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">
                      Additional projects ({projectCount - 1} × $4.99)
                    </span>
                    <span className="text-zinc-900 font-medium">${pricing.addon.toFixed(2)}/mo</span>
                  </div>
                )}
                <div className="border-t border-zinc-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-900 font-semibold">Total</span>
                    <span className="text-[#f97352] font-bold text-xl">${pricing.total.toFixed(2)}/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleSubscribeNow}
                disabled={loading}
                className="w-full h-12 bg-[#f97352] hover:bg-[#e8634a] text-white font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Subscribe Now — $${pricing.total.toFixed(2)}/mo`
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-zinc-500">or</span>
                </div>
              </div>

              <Button
                onClick={handleStartTrial}
                disabled={loading}
                variant="outline"
                className="w-full h-12 font-semibold"
              >
                Start 7-Day Free Trial
              </Button>
              <p className="text-center text-xs text-zinc-400">
                No credit card required for trial
              </p>
            </div>

            {/* Back button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setStep("company")}
                className="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-2 h-2 rounded-full bg-[#f97352]" />
              <div className="w-2 h-2 rounded-full bg-[#f97352]" />
              <div className="w-2 h-2 rounded-full bg-[#f97352]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
