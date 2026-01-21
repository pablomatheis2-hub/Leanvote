"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  MessageSquare, 
  ArrowRight, 
  Copy, 
  Check, 
  Code2, 
  Zap,
  Settings2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Rocket,
  Wrench
} from "lucide-react";

const codeExamples = {
  basic: `<!-- Add this before closing </body> tag -->
<script src="https://leanvote.app/widget.js"></script>
<script>
  LeanVoteWidget.init({
    boardSlug: 'YOUR_BOARD_SLUG'
  });
</script>`,
  
  customized: `<script src="https://leanvote.app/widget.js"></script>
<script>
  LeanVoteWidget.init({
    boardSlug: 'YOUR_BOARD_SLUG',
    position: 'bottom-right',      // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    primaryColor: '#f97352',       // Your brand color
    buttonText: 'Send Feedback',   // Custom button text
    showOnMobile: true,            // Show/hide on mobile devices
    zIndex: 9999                   // CSS z-index
  });
</script>`,

  react: `// components/FeedbackWidget.tsx
'use client';

import { useEffect } from 'react';

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
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  buttonText?: string;
  showOnMobile?: boolean;
  zIndex?: number;
}

export function FeedbackWidget({ boardSlug }: { boardSlug: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://leanvote.app/widget.js';
    script.async = true;
    
    script.onload = () => {
      window.LeanVoteWidget?.init({
        boardSlug,
        primaryColor: '#f97352',
        buttonText: 'Feedback'
      });
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [boardSlug]);

  return null;
}

// Usage in your app
// <FeedbackWidget boardSlug="your-board-slug" />`,

  vue: `<!-- FeedbackWidget.vue -->
<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  boardSlug: string;
  primaryColor?: string;
  buttonText?: string;
}>();

let script: HTMLScriptElement | null = null;

onMounted(() => {
  script = document.createElement('script');
  script.src = 'https://leanvote.app/widget.js';
  script.async = true;
  
  script.onload = () => {
    (window as any).LeanVoteWidget?.init({
      boardSlug: props.boardSlug,
      primaryColor: props.primaryColor || '#f97352',
      buttonText: props.buttonText || 'Feedback'
    });
  };
  
  document.body.appendChild(script);
});

onUnmounted(() => {
  if (script) {
    document.body.removeChild(script);
  }
});
</script>

<!-- Usage: <FeedbackWidget board-slug="your-board-slug" /> -->`,

  api: `// Open the widget programmatically
LeanVoteWidget.open();

// Close the widget
LeanVoteWidget.close();

// Toggle the widget
LeanVoteWidget.toggle();

// Open the full feedback page in a new tab
LeanVoteWidget.openFullPage();

// Get widget version
console.log(LeanVoteWidget.version);`
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-400 hover:text-white transition-all"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <pre className="bg-zinc-900 text-zinc-100 rounded-xl p-5 overflow-x-auto text-sm leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function AccordionItem({ 
  title, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-zinc-50 transition-colors"
      >
        <span className="font-semibold text-zinc-900">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-5 pt-0 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f97352] flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-zinc-900">LeanVote</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/docs" 
              className="text-sm font-medium text-[#f97352]"
            >
              Docs
            </Link>
            <Link 
              href="/auth/login" 
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/login"
              className="text-sm font-medium bg-[#f97352] text-white px-4 py-2 rounded-lg hover:bg-[#e8634a] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fff5f2] rounded-full text-[#f97352] text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Documentation
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-zinc-900 tracking-tight mb-5">
            Add a feedback widget to your site
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Embed the LeanVote widget on your website to collect feedback, share your roadmap, 
            and keep users updated with your changelog — all without leaving your app.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-zinc-900">Quick Start</h2>
            </div>
            
            <p className="text-zinc-600 mb-6">
              Add these two lines before your closing <code className="px-1.5 py-0.5 bg-zinc-100 rounded text-sm font-mono">&lt;/body&gt;</code> tag:
            </p>

            <CodeBlock code={codeExamples.basic} />

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>💡 Tip:</strong> Replace <code className="px-1.5 py-0.5 bg-amber-100 rounded font-mono">YOUR_BOARD_SLUG</code> with your actual board slug from the{" "}
                <Link href="/dashboard/settings" className="underline hover:text-amber-900">
                  dashboard settings
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Configuration Options */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-zinc-900">Configuration Options</h2>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left p-4 font-semibold text-zinc-900">Option</th>
                  <th className="text-left p-4 font-semibold text-zinc-900">Type</th>
                  <th className="text-left p-4 font-semibold text-zinc-900">Default</th>
                  <th className="text-left p-4 font-semibold text-zinc-900">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">boardSlug</td>
                  <td className="p-4 text-sm text-zinc-500">string</td>
                  <td className="p-4 text-sm text-zinc-400">required</td>
                  <td className="p-4 text-sm text-zinc-600">Your unique board identifier</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">position</td>
                  <td className="p-4 text-sm text-zinc-500">string</td>
                  <td className="p-4 font-mono text-sm text-zinc-400">&apos;bottom-right&apos;</td>
                  <td className="p-4 text-sm text-zinc-600">Widget position: &apos;bottom-right&apos;, &apos;bottom-left&apos;, &apos;top-right&apos;, &apos;top-left&apos;</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">primaryColor</td>
                  <td className="p-4 text-sm text-zinc-500">string</td>
                  <td className="p-4 font-mono text-sm text-zinc-400">&apos;#f97352&apos;</td>
                  <td className="p-4 text-sm text-zinc-600">Primary color for button and accents</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">buttonText</td>
                  <td className="p-4 text-sm text-zinc-500">string</td>
                  <td className="p-4 font-mono text-sm text-zinc-400">&apos;Feedback&apos;</td>
                  <td className="p-4 text-sm text-zinc-600">Text displayed on the widget button</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">showOnMobile</td>
                  <td className="p-4 text-sm text-zinc-500">boolean</td>
                  <td className="p-4 font-mono text-sm text-zinc-400">true</td>
                  <td className="p-4 text-sm text-zinc-600">Whether to show the widget on mobile devices</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">zIndex</td>
                  <td className="p-4 text-sm text-zinc-500">number</td>
                  <td className="p-4 font-mono text-sm text-zinc-400">9999</td>
                  <td className="p-4 text-sm text-zinc-600">CSS z-index for the widget container</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-lg text-zinc-900 mb-4">Full Configuration Example</h3>
            <CodeBlock code={codeExamples.customized} />
          </div>
        </div>
      </section>

      {/* Framework Integrations */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-zinc-900">Framework Integrations</h2>
          </div>

          <div className="space-y-4">
            <AccordionItem title="React / Next.js" defaultOpen={true}>
              <p className="text-zinc-600 mb-4">
                Create a client component to load the widget in your React or Next.js application:
              </p>
              <CodeBlock code={codeExamples.react} />
            </AccordionItem>

            <AccordionItem title="Vue.js / Nuxt">
              <p className="text-zinc-600 mb-4">
                Create a component to load the widget in your Vue.js or Nuxt application:
              </p>
              <CodeBlock code={codeExamples.vue} />
            </AccordionItem>

            <AccordionItem title="Vanilla JavaScript">
              <p className="text-zinc-600 mb-4">
                For plain HTML/JavaScript sites, just add the script tag to your HTML:
              </p>
              <CodeBlock code={codeExamples.basic} />
            </AccordionItem>
          </div>
        </div>
      </section>

      {/* JavaScript API */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#fff5f2] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#f97352]" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-zinc-900">JavaScript API</h2>
          </div>

          <p className="text-zinc-600 mb-6">
            Control the widget programmatically with these methods:
          </p>

          <CodeBlock code={codeExamples.api} />

          <div className="mt-8 bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left p-4 font-semibold text-zinc-900">Method</th>
                  <th className="text-left p-4 font-semibold text-zinc-900">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">LeanVoteWidget.init(config)</td>
                  <td className="p-4 text-sm text-zinc-600">Initialize the widget with configuration options</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">LeanVoteWidget.open()</td>
                  <td className="p-4 text-sm text-zinc-600">Open the feedback panel</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">LeanVoteWidget.close()</td>
                  <td className="p-4 text-sm text-zinc-600">Close the feedback panel</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">LeanVoteWidget.toggle()</td>
                  <td className="p-4 text-sm text-zinc-600">Toggle the feedback panel open/closed</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm text-[#f97352]">LeanVoteWidget.openFullPage()</td>
                  <td className="p-4 text-sm text-zinc-600">Open the full feedback board in a new tab</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-zinc-900">Common Use Cases</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">Collect Feature Requests</h3>
              <p className="text-zinc-500 text-sm">
                Let users submit and vote on feature ideas directly from your app. Prioritize based on what your users actually want.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">Bug Reports</h3>
              <p className="text-zinc-500 text-sm">
                Make it easy for users to report bugs without leaving your application. Track and respond to issues quickly.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                </svg>
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">Public Roadmap</h3>
              <p className="text-zinc-500 text-sm">
                Share your product roadmap to keep users informed about what&apos;s coming next and build anticipation.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">Changelog Updates</h3>
              <p className="text-zinc-500 text-sm">
                Keep users updated with your latest releases and improvements. Build trust by showing consistent progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-10 text-center">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
              Ready to collect feedback?
            </h2>
            <p className="text-zinc-400 mb-8">
              Create your board and start embedding the widget on your site today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/login"
                className="group flex items-center gap-2 bg-[#f97352] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#e8634a] transition-colors"
              >
                Create Your Board
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link 
                href="/dashboard/settings"
                className="flex items-center gap-2 text-zinc-300 hover:text-white font-medium px-6 py-3 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#f97352] flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-white" />
            </div>
            <span className="font-heading font-bold text-zinc-900">LeanVote</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-zinc-900 transition-colors">Docs</Link>
            <Link href="/auth/login" className="hover:text-zinc-900 transition-colors">Sign In</Link>
          </div>
          
          <p className="text-sm text-zinc-400">
            © {new Date().getFullYear()} LeanVote
          </p>
        </div>
      </footer>
    </div>
  );
}
