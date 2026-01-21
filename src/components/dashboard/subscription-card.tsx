"use client";

import { useState } from "react";
import { Check, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccessStatus } from "@/types/database";

interface SubscriptionCardProps {
  accessStatus: AccessStatus;
}

export function SubscriptionCard({ accessStatus }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  if (accessStatus.hasLifetimeAccess) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Lifetime Access
            </h2>
            <p className="text-zinc-600 mt-1">
              You have lifetime access to all LeanVote features. Thank you for your support!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-zinc-900">
              Subscription
            </h2>
            {accessStatus.isInTrial && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                <Clock className="w-3 h-3" />
                Trial
              </span>
            )}
          </div>
          <p className="text-zinc-500 mt-1">
            {accessStatus.isInTrial ? (
              <>
                Your free trial ends in{" "}
                <span className="font-semibold text-zinc-700">
                  {accessStatus.daysRemaining} {accessStatus.daysRemaining === 1 ? "day" : "days"}
                </span>
              </>
            ) : (
              "Your trial has expired"
            )}
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="text-3xl font-bold text-zinc-900">$49</span>
            <span className="text-zinc-500">one-time</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[#f97352]" />
          <span className="text-sm font-medium text-zinc-900">Lifetime Deal Includes:</span>
        </div>
        <ul className="grid grid-cols-2 gap-2 text-sm text-zinc-600 mb-6">
          {[
            "Unlimited feedback posts",
            "Public voting board",
            "Roadmap management",
            "Changelog page",
            "Custom board URL",
            "Priority support",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full h-11 bg-[#f97352] hover:bg-[#e8634a] text-white font-semibold"
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
            "Upgrade to Lifetime Access"
          )}
        </Button>
      </div>
    </div>
  );
}
