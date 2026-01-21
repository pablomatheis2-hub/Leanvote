"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Vote, LayoutDashboard, ArrowRight, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeOnboardingAsVoter, completeOnboardingAsAdmin } from "@/lib/actions/onboarding";
import { cn } from "@/lib/utils";

type Choice = "voter" | "admin" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!choice) return;
    
    setLoading(true);
    setError(null);

    try {
      if (choice === "voter") {
        const result = await completeOnboardingAsVoter();
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        // Redirect to home - they can navigate to boards from there
        router.push("/");
      } else {
        const result = await completeOnboardingAsAdmin();
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        // Redirect to their new dashboard
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
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
          onClick={handleContinue}
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
      </div>
    </div>
  );
}
