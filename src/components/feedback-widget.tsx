"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    LeanVoteWidget?: {
      init: (config: WidgetConfig) => void;
      open: () => void;
      close: () => void;
      toggle: () => void;
    };
  }
}

interface WidgetConfig {
  boardSlug: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor?: string;
  buttonText?: string;
  showOnMobile?: boolean;
  zIndex?: number;
}

export function FeedbackWidget() {
  useEffect(() => {
    // Don't load the widget on the widget-test page or board pages
    if (
      window.location.pathname.includes("/widget-test") ||
      window.location.pathname.startsWith("/b/")
    ) {
      return;
    }

    const script = document.createElement("script");
    script.src = "/widget.js";
    script.async = true;

    script.onload = () => {
      window.LeanVoteWidget?.init({
        boardSlug: "leanvote",
        position: "bottom-right",
        primaryColor: "#f97352",
        buttonText: "Feedback",
        showOnMobile: true,
        zIndex: 9999,
      });
    };

    document.body.appendChild(script);

    return () => {
      // Clean up widget on unmount
      const widgetContainer = document.querySelector(".lv-widget-container");
      if (widgetContainer) {
        widgetContainer.remove();
      }
      // Remove script
      const existingScript = document.querySelector(
        'script[src="/widget.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}
