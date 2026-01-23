"use client";

import { useEffect } from "react";

export function FeedbackWidget() {
  useEffect(() => {
    // Skip on widget-test and board pages
    if (window.location.pathname.includes("/widget-test") || window.location.pathname.startsWith("/b/")) return;

    const script = document.createElement("script");
    script.src = "/widget.js";
    script.async = true;
    script.onload = () => {
      (window as any).LeanVoteWidget?.init({
        boardSlug: "leanvote",
        primaryColor: "#f97352",
      });
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
