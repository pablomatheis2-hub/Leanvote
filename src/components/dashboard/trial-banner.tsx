"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Clock } from "lucide-react";

interface TrialBannerProps {
  daysRemaining: number;
}

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const urgency = daysRemaining <= 2 ? "bg-amber-500" : "bg-[#f97352]";

  return (
    <div className={`${urgency} text-white px-4 py-2.5`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {daysRemaining === 1 
              ? "Your trial ends tomorrow!" 
              : daysRemaining <= 0 
                ? "Your trial has ended" 
                : `${daysRemaining} days left in your free trial`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings"
            className="text-sm font-semibold hover:underline underline-offset-2"
          >
            Upgrade Now →
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
