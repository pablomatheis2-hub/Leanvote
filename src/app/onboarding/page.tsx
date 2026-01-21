"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Vote, LayoutDashboard, ArrowRight, ArrowLeft, Check, Zap, Building2, Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboardingAsVoter, completeOnboardingAsAdmin } from "@/lib/actions/onboarding";
import { cn } from "@/lib/utils";

type Choice = "voter" | "admin" | null;
type Step = "choose" | "company-info";

interface CompanyInfo {
  companyName: string;
  companyUrl: string;
  companyDescription: string;
}

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  
  const [choice, setChoice] = useState<Choice>(null);
  const [step, setStep] = useState<Step>("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Company info for admin onboarding
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: "",
    companyUrl: "",
    companyDescription: "",
  });

  const handleChoiceContinue = async () => {
    if (!choice) return;
    
    if (choice === "voter") {
      // Voters complete immediately
      setLoading(true);
      setError(null);
      
      try {
        const result = await completeOnboardingAsVoter();
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        router.push(redirectTo || "/find-board");
      } catch {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    } else {
      // Admins go to company info step
      setStep("company-info");
    }
  };

  const handleAdminComplete = async () => {
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

  const handleBack = () => {
    setStep("choose");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-orange-50/30 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-12">
          <div className="w-10 h-10 rounded-xl bg-[#f97352] flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-2xl text-zinc-900">LeanVote</span>
        </div>

        {step === "choose" ? (
          <>
            {/* Welcome */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-semibold text-zinc-900 mb-3">
                Welcome to LeanVote! 👋
              </h1>
              <p className="text-lg text-zinc-500">
                What would you like to do?
              </p>
            </div>

            {/* Options */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {/* Voter option */}
              <button
                onClick={() => setChoice("voter")}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all",
                  choice === "voter"
                    ? "border-[#f97352] bg-[#fff5f2]"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  choice === "voter" ? "bg-[#f97352]" : "bg-zinc-100"
                )}>
                  <Vote className={cn("w-6 h-6", choice === "voter" ? "text-white" : "text-zinc-500")} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                  Vote & Give Feedback
                </h3>
                <p className="text-sm text-zinc-500">
                  I want to vote and submit feedback on someone else&apos;s board.
                </p>
                {choice === "voter" && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#f97352] font-medium">
                    <Check className="w-4 h-4" />
                    Free forever
                  </div>
                )}
              </button>

              {/* Admin option */}
              <button
                onClick={() => setChoice("admin")}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden",
                  choice === "admin"
                    ? "border-[#f97352] bg-[#fff5f2]"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                )}
              >
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    <Zap className="w-3 h-3" />
                    7-day trial
                  </span>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  choice === "admin" ? "bg-[#f97352]" : "bg-zinc-100"
                )}>
                  <LayoutDashboard className={cn("w-6 h-6", choice === "admin" ? "text-white" : "text-zinc-500")} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                  Create a Feedback Board
                </h3>
                <p className="text-sm text-zinc-500">
                  I want to collect feedback and votes from my users.
                </p>
                {choice === "admin" && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#f97352] font-medium">
                    <Check className="w-4 h-4" />
                    Start with 7-day free trial
                  </div>
                )}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Continue button */}
            <Button
              onClick={handleChoiceContinue}
              disabled={!choice || loading}
              className="w-full h-12 bg-[#f97352] hover:bg-[#e8634a] text-white font-semibold text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Setting up...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            {/* Note */}
            <p className="text-center text-sm text-zinc-400 mt-6">
              {choice === "admin" 
                ? "You can always change your mind later in settings."
                : "You can upgrade to create your own board anytime."}
            </p>
          </>
        ) : (
          <>
            {/* Company Info Step */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-semibold text-zinc-900 mb-3">
                Tell us about your company
              </h1>
              <p className="text-lg text-zinc-500">
                This helps users find your feedback board
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
              <div className="space-y-5">
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
                  <p className="text-xs text-zinc-400">
                    This will be displayed on your feedback board
                  </p>
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
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleBack}
                variant="outline"
                disabled={loading}
                className="h-12 px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleAdminComplete}
                disabled={!companyInfo.companyName.trim() || loading}
                className="flex-1 h-12 bg-[#f97352] hover:bg-[#e8634a] text-white font-semibold text-base disabled:opacity-50"
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
                  <span className="flex items-center gap-2">
                    Create My Board
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-2 h-2 rounded-full bg-[#f97352]" />
              <div className="w-2 h-2 rounded-full bg-[#f97352]" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#f97352] rounded-full" />
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  );
}
