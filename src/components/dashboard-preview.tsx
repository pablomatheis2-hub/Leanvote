"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const feedbackItems = [
  { votes: 47, title: "Dark mode support", tag: "Feature", tagColor: "coral", status: "Planned" },
  { votes: 32, title: "Mobile app for iOS", tag: "Feature", tagColor: "coral", status: "In Progress" },
  { votes: 28, title: "Export data to CSV", tag: "Improvement", tagColor: "blue", status: "Open" },
];

const changelogItems = [
  {
    version: "v2.1.0",
    date: "Jan 15, 2026",
    title: "Dark mode is here!",
    description: "You asked, we delivered. Dark mode is now available for all users.",
    tag: "Feature",
  },
  {
    version: "v2.0.5",
    date: "Jan 10, 2026",
    title: "Performance improvements",
    description: "Faster loading times and smoother animations across the board.",
    tag: "Improvement",
  },
  {
    version: "v2.0.0",
    date: "Jan 5, 2026",
    title: "New voting system",
    description: "Redesigned voting experience with real-time updates.",
    tag: "Feature",
  },
];

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<"feedback" | "changelog">("feedback");

  return (
    <div className="bg-gradient-to-br from-[#fff5f2] to-[#ffeee8] rounded-3xl p-3">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Mock browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white border border-gray-200 rounded-md px-4 py-1 text-xs text-gray-400">
              feedback.yourcompany.com
            </div>
          </div>
        </div>

        {/* Mock header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f97352] flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-heading font-bold text-gray-900">LeanVote</span>
            </div>
            
            {/* Navigation tabs */}
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("feedback")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  activeTab === "feedback"
                    ? "bg-[#fff5f2] text-[#f97352]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                Feedback
              </button>
              <button
                onClick={() => setActiveTab("changelog")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  activeTab === "changelog"
                    ? "bg-[#fff5f2] text-[#f97352]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                Changelog
              </button>
            </nav>
          </div>
          
          <div className="w-7 h-7 rounded-full bg-[#fff5f2] flex items-center justify-center text-xs font-medium text-[#f97352]">
            JD
          </div>
        </div>
        
        {/* Content area */}
        <div className="p-6">
          {activeTab === "feedback" ? (
            <FeedbackContent />
          ) : (
            <ChangelogContent />
          )}
        </div>
      </div>
    </div>
  );
}

function FeedbackContent() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-heading font-semibold text-gray-900 text-lg">Feedback Board</div>
          <div className="text-sm text-gray-500 mt-0.5">Share your ideas and vote</div>
        </div>
        <div className="bg-[#f97352] text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer hover:bg-[#e8634a] transition-colors">
          + New Post
        </div>
      </div>
      
      {/* Sort tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-4">
        <div className="px-3 py-1.5 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm">
          Most Voted
        </div>
        <div className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-500">
          Newest
        </div>
      </div>
      
      {/* Feedback cards */}
      <div className="space-y-3">
        {feedbackItems.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white border border-gray-200">
              <span className="text-lg font-semibold text-gray-900">{item.votes}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">votes</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-900 font-medium mb-1">{item.title}</div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  item.tagColor === "coral" 
                    ? "bg-[#fff5f2] text-[#f97352]" 
                    : "bg-blue-50 text-blue-600"
                )}>
                  {item.tag}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                  item.status === "Open" && "bg-gray-100 text-gray-600",
                  item.status === "Planned" && "bg-amber-50 text-amber-600",
                  item.status === "In Progress" && "bg-blue-50 text-blue-600"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    item.status === "Open" && "bg-gray-400",
                    item.status === "Planned" && "bg-amber-400",
                    item.status === "In Progress" && "bg-blue-400"
                  )} />
                  {item.status}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-400 hidden sm:block">2 days ago</div>
          </div>
        ))}
      </div>
    </>
  );
}

function ChangelogContent() {
  return (
    <>
      <div className="mb-6">
        <div className="font-heading font-semibold text-gray-900 text-lg">Changelog</div>
        <div className="text-sm text-gray-500 mt-0.5">Latest updates and improvements</div>
      </div>
      
      {/* Changelog entries */}
      <div className="space-y-6">
        {changelogItems.map((item, i) => (
          <div key={i} className="relative pl-6 pb-6 border-l-2 border-gray-100 last:pb-0">
            {/* Timeline dot */}
            <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[#f97352]" />
            
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium text-[#f97352] bg-[#fff5f2] px-2 py-0.5 rounded">
                {item.version}
              </span>
              <span className="text-xs text-gray-400">{item.date}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                item.tag === "Feature" 
                  ? "bg-[#fff5f2] text-[#f97352]" 
                  : "bg-blue-50 text-blue-600"
              )}>
                {item.tag}
              </span>
            </div>
            
            <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
