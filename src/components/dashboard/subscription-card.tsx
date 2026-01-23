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
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Lifetime Access
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
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
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                Pro Subscription
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                <Check className="w-3 h-3" />
                Active
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {accessStatus.projectLimit} {accessStatus.projectLimit === 1 ? "project" : "projects"} • ${currentPricing.total.toFixed(2)}/month
            </p>
            {accessStatus.subscriptionEndsAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Renews on {accessStatus.subscriptionEndsAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Project count editor */}
        {showProjectEditor ? (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <label className="block text-sm font-medium text-foreground mb-3">
              Update project limit
            </label>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setProjectCount(Math.max(1, projectCount - 1))}
                disabled={projectCount <= 1}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-background disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-2xl font-bold text-foreground">{projectCount}</span>
                <p className="text-xs text-muted-foreground">{projectCount === 1 ? "project" : "projects"}</p>
              </div>
              <button
                onClick={() => setProjectCount(projectCount + 1)}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-background"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted-foreground">New monthly total</span>
              <span className="font-semibold text-foreground">${pricing.total.toFixed(2)}/mo</span>
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

        <p className="text-xs text-muted-foreground">
          Manage billing, payment method, and cancel anytime from Stripe portal.
        </p>
      </div>
    );
  }

  // Trial or expired - show subscription options
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Subscription
            </h2>
            {accessStatus.isInTrial && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                <Clock className="w-3 h-3" />
                Trial
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {accessStatus.isInTrial ? (
              <>
                Your free trial ends in{" "}
                <span className="font-semibold text-foreground">
                  {accessStatus.daysRemaining} {accessStatus.daysRemaining === 1 ? "day" : "days"}
                </span>
              </>
            ) : (
              "Your trial has expired"
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-border">
        {/* Project counter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            How many projects do you need?
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setProjectCount(Math.max(1, projectCount - 1))}
              disabled={projectCount <= 1}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center min-w-[60px]">
              <span className="text-2xl font-bold text-foreground">{projectCount}</span>
            </div>
            <button
              onClick={() => setProjectCount(projectCount + 1)}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base plan (1 project)</span>
              <span className="text-foreground">${pricing.base.toFixed(2)}/mo</span>
            </div>
            {projectCount > 1 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{projectCount - 1} extra {projectCount - 1 === 1 ? "project" : "projects"}</span>
                <span className="text-foreground">${pricing.addon.toFixed(2)}/mo</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-border font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">${pricing.total.toFixed(2)}/mo</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Pro Plan Includes:</span>
        </div>
        <ul className="grid grid-cols-2 gap-1.5 text-sm text-muted-foreground mb-5">
          {[
            "Unlimited feedback posts",
            "Public voting board",
            "Roadmap management",
            "Changelog page",
            "Custom board URL",
            "Priority support",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full h-10"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
        <p className="text-xs text-muted-foreground text-center mt-2">
          7-day free trial included. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
