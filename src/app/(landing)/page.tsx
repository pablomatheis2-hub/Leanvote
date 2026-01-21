"use client";

import Link from "next/link";
import { MessageSquare, ArrowRight, Check, Zap } from "lucide-react";
import { Typewriter } from "@/components/typewriter";
import { DashboardPreview } from "@/components/dashboard-preview";

const rotatingTexts = [
  "Collect feedback",
  "Get feature ideas",
  "Prioritize requests",
  "Track bug reports",
  "Build what matters",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f97352] flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-gray-900">LeanVote</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/auth/login" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/login"
              className="text-sm font-medium bg-[#f97352] text-white px-4 py-2 rounded-lg hover:bg-[#e8634a] transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full text-amber-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            7-day free trial, then $49 lifetime access
          </div>
          
          <h1 className="font-heading font-bold text-5xl md:text-6xl text-gray-900 leading-[1.15] tracking-tight mb-6">
            <Typewriter
              texts={rotatingTexts}
              className="text-[#f97352] text-accent-underline"
              typingSpeed={70}
              deletingSpeed={40}
              pauseDuration={2500}
            />
            <br />
            from your users.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            A simple feedback board where your customers can share ideas, report bugs, and vote on what matters most.
          </p>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link 
              href="/auth/login"
              className="group flex items-center gap-2 bg-[#f97352] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#e8634a] transition-colors"
            >
              Start your free trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 font-medium px-6 py-3 transition-colors"
            >
              See how it works
            </Link>
          </div>
          
          {/* Quick benefits */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#f97352]" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#f97352]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#f97352]" />
              <span>Setup in minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <DashboardPreview />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 tracking-tight mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-500 max-w-lg mx-auto">
              Simple tools to collect, organize, and act on customer feedback.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Feedback Collection",
                description: "Let customers submit ideas and bug reports in a clean interface.",
              },
              {
                title: "Voting System",
                description: "Users vote to surface the most requested features automatically.",
              },
              {
                title: "Public Roadmap",
                description: "Share your roadmap to keep customers informed and engaged.",
              },
              {
                title: "Shareable Links",
                description: "Get a unique URL for your board to share with your users.",
              },
              {
                title: "Changelog",
                description: "Automatically generate a changelog from completed items.",
              },
              {
                title: "Status Updates",
                description: "Keep users informed with Open, Planned, In Progress, and Complete statuses.",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#fff5f2] flex items-center justify-center mb-5">
                  <div className="w-3 h-3 rounded-full bg-[#f97352]" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-500">
              Get started in three simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Create your board",
                description: "Sign up and get your own feedback board with a unique shareable URL.",
              },
              {
                step: "2",
                title: "Share with users",
                description: "Share the link with your customers so they can submit and vote on feedback.",
              },
              {
                step: "3",
                title: "Build what matters",
                description: "Use votes and feedback to prioritize what to build next.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#f97352] text-white font-heading font-bold text-xl flex items-center justify-center mx-auto mb-5">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 tracking-tight mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-gray-500">
              One price, lifetime access. No subscriptions.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fff5f2] rounded-full text-[#f97352] text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Lifetime Deal
            </div>
            
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-bold text-gray-900">$49</span>
              <span className="text-gray-500">one-time</span>
            </div>
            <p className="text-gray-500 mb-8">Pay once, own it forever</p>
            
            <ul className="space-y-3 text-left mb-8">
              {[
                "7-day free trial",
                "Unlimited feedback posts",
                "Public voting board",
                "Roadmap management",
                "Changelog page",
                "Custom board URL",
                "Priority support",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <Link 
              href="/auth/login"
              className="block w-full bg-[#f97352] text-white font-semibold py-3 rounded-lg hover:bg-[#e8634a] transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Start collecting feedback from your users today with a 7-day free trial.
          </p>
          <Link 
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-[#f97352] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#e8634a] transition-colors"
          >
            Get started for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#f97352] flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-white" />
            </div>
            <span className="font-heading font-bold text-gray-900">LeanVote</span>
          </div>
          
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} LeanVote
          </p>
        </div>
      </footer>
    </div>
  );
}
