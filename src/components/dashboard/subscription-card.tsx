"use client";

import { useState } from "react";
import { Check, Zap, Clock, CreditCard, Minus, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccessStatus } from "@/types/database";
import { getSubscriptionPrice } from "@/lib/access";

interface SubscriptionCardProps {
  accessStatus: AccessStatus;
}

export function SubscriptionCard({ accessStatus }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [projectCount, setProjectCount] = useState(accessStatus.projectLimit || 1);
  const [showProjectEditor, setShowProjectEditor] = useState(false);

  const pricing = getSubscriptionPrice(projectCount);

  const handleSubscribe = async () => {
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

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/manage", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No portal URL returned");
        setLoading(false);
      }
    } catch (error) {
      console.error("Portal error:", error);
      setLoading(false);
    }
  };

  const handleUpdateProjectCount = async () => {
    if (projectCount === accessStatus.projectLimit) {
      setShowProjectEditor(false);
      return;
    }

    setUpgradeLoading(true);
    try {
      const response = await fetch("/api/stripe/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectCount }),
      });
      const data = await response.json();
      
      if (data.success) {
        window.location.reload();
      } else {
        console.error("Update failed:", data.error);
        setUpgradeLoading(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      setUpgradeLoading(false);
    }
  };

  // Lifetime access view (kept for existing lifetime users)
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

  // Active subscription view
  if (accessStatus.hasActiveSubscription) {
    const currentPricing = getSubscriptionPrice(accessStatus.projectLimit);
    
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-900">
                Pro Subscription
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                <Check className="w-3 h-3" />
                Active
              </span>
            </div>
            <p className="text-zinc-500 mt-1">
              {accessStatus.projectLimit} {accessStatus.projectLimit === 1 ? "project" : "projects"} • ${currentPricing.total.toFixed(2)}/month
            </p>
            {accessStatus.subscriptionEndsAt && (
              <p className="text-xs text-zinc-400 mt-1">
                Renews on {accessStatus.subscriptionEndsAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Project count editor */}
        {showProjectEditor ? (
          <div className="bg-zinc-50 rounded-lg p-4 mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-3">
              Update project limit
            </label>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setProjectCount(Math.max(1, projectCount - 1))}
                disabled={projectCount <= 1}
                className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-white disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-2xl font-bold text-zinc-900">{projectCount}</span>
                <p className="text-xs text-zinc-500">{projectCount === 1 ? "project" : "projects"}</p>
              </div>
              <button
                onClick={() => setProjectCount(projectCount + 1)}
                className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-zinc-600">New monthly total</span>
              <span className="font-semibold text-zinc-900">${pricing.total.toFixed(2)}/mo</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setProjectCount(accessStatus.projectLimit);
                  setShowProjectEditor(false);
                }}
                variant="outline"
                size="sm"
                disabled={upgradeLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProjectCount}
                size="sm"
                disabled={upgradeLoading || projectCount === accessStatus.projectLimit}
                className="bg-[#f97352] hover:bg-[#e8634a]"
              >
                {upgradeLoading ? "Updating..." : "Update Plan"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setShowProjectEditor(true)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Projects
            </Button>
            <Button
              onClick={handleManageSubscription}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Manage
            </Button>
          </div>
        )}

        <p className="text-xs text-zinc-400">
          Manage billing, payment method, and cancel anytime from Stripe portal.
        </p>
      </div>
    );
  }

  // Trial or expired - show subscription options
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
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-100">
        {/* Project counter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            How many projects do you need?
          </label>
          <div className="flex items-center gap-3">
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
        </div>

        {/* Pricing breakdown */}
        <div className="bg-zinc-50 rounded-lg p-3 mb-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Base plan (1 project)</span>
              <span className="text-zinc-900">${pricing.base.toFixed(2)}/mo</span>
            </div>
            {projectCount > 1 && (
              <div className="flex justify-between">
                <span className="text-zinc-600">{projectCount - 1} extra {projectCount - 1 === 1 ? "project" : "projects"}</span>
                <span className="text-zinc-900">${pricing.addon.toFixed(2)}/mo</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-zinc-200 font-semibold">
              <span className="text-zinc-900">Total</span>
              <span className="text-[#f97352]">${pricing.total.toFixed(2)}/mo</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[#f97352]" />
          <span className="text-sm font-medium text-zinc-900">Pro Plan Includes:</span>
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
          onClick={handleSubscribe}
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
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Subscribe — ${pricing.total.toFixed(2)}/mo
            </span>
          )}
        </Button>
        <p className="text-xs text-zinc-400 text-center mt-2">
          7-day free trial included. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
