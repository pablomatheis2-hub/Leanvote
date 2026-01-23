"use client";

import { useState } from "react";
import { Lock, Check, Zap, Minus, Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSubscriptionPrice } from "@/lib/access";

export function PaywallGate() {
  const [loading, setLoading] = useState(false);
  const [projectCount, setProjectCount] = useState(1);

  const pricing = getSubscriptionPrice(projectCount);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
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
        console.error("No checkout URL returned");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  const features = [
    "Unlimited feedback posts",
    "Public voting board",
    "Roadmap management",
    "Changelog page",
    "Custom board URL",
    "Priority support",
  ];

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          Your free trial has ended
        </h1>
        <p className="text-zinc-500">
          Subscribe to continue using LeanVote
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-[#f97352]" />
            <span className="text-sm font-semibold text-[#f97352] uppercase tracking-wide">
              Pro Plan
            </span>
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-zinc-900">${pricing.total.toFixed(2)}</span>
            <span className="text-zinc-500">/month</span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Cancel anytime
          </p>
        </div>

        {/* Project counter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 mb-2 text-center">
            How many projects do you need?
          </label>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setProjectCount(Math.max(1, projectCount - 1))}
              disabled={projectCount <= 1}
              className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center min-w-[60px]">
              <span className="text-2xl font-bold text-zinc-900">{projectCount}</span>
            </div>
            <button
              onClick={() => setProjectCount(projectCount + 1)}
              className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {projectCount > 1 && (
            <p className="text-xs text-center text-zinc-500 mt-2">
              Base $9.99 + {projectCount - 1} extra project{projectCount > 2 ? "s" : ""} × $4.99
            </p>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-zinc-700">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full h-12 bg-[#f97352] hover:bg-[#e8634a] text-white font-semibold text-base"
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
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Subscribe — ${pricing.total.toFixed(2)}/mo
            </span>
          )}
        </Button>

        <p className="text-xs text-center text-zinc-400 mt-4">
          Secure payment powered by Stripe • Cancel anytime
        </p>
      </div>
    </div>
  );
}
