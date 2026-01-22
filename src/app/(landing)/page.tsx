"use client";

import Link from "next/link";
import { MessageSquare, ArrowRight, Check, Zap } from "lucide-react";
import { Typewriter } from "@/components/typewriter";
import { DashboardPreview } from "@/components/dashboard-preview";
import { FAQSchema, landingPageFAQs } from "@/components/seo/faq-schema";

const rotatingTexts = [
  "Collect feedback",
  "Get feature ideas",
  "Prioritize requests",
  "Track bug reports",
  "Build what matters",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <FAQSchema faqs={landingPageFAQs} />
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">LeanVote</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/docs" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <Link 
              href="/auth/login" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/login"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Free Board
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading font-bold text-5xl md:text-6xl text-foreground leading-[1.15] tracking-tight mb-6">
            <Typewriter
              texts={rotatingTexts}
              className="text-primary text-accent-underline"
              typingSpeed={70}
              deletingSpeed={40}
              pauseDuration={2500}
            />
            <br />
            from your users.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            A simple feedback board where your customers can share ideas, report bugs, and vote on what matters most.
          </p>
          
          {/* CTA */}
          <div className="flex flex-col items-center gap-3 mb-12">
            <Link 
              href="/auth/login"
              className="group flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-lg px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/25"
            >
              Create Free Board
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <DashboardPreview />
        </div>
      </section>

      {/* Why Switch - Comparison Table */}
      <section className="py-20 px-6 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground tracking-tight mb-4">
              Why switch?
            </h2>
            <p className="text-lg text-muted-foreground">
              See how LeanVote compares to monthly subscription tools.
            </p>
          </div>
          
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-5 text-sm font-semibold text-foreground bg-muted/50">Feature</th>
                  <th className="text-center p-5 text-sm font-semibold text-muted-foreground bg-muted/50">Canny, Upvoty, etc.</th>
                  <th className="text-center p-5 text-sm font-semibold text-primary bg-secondary">LeanVote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-5 text-foreground/80 font-medium">Pricing</td>
                  <td className="p-5 text-center">
                    <span className="text-muted-foreground">$49–$400/month</span>
                  </td>
                  <td className="p-5 text-center bg-secondary/50">
                    <span className="text-emerald-600 font-bold text-lg">$49 once</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-5 text-foreground/80 font-medium">Users</td>
                  <td className="p-5 text-center">
                    <span className="text-muted-foreground">Limited by plan</span>
                  </td>
                  <td className="p-5 text-center bg-secondary/50">
                    <span className="text-foreground font-semibold">Unlimited</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-5 text-foreground/80 font-medium">Complexity</td>
                  <td className="p-5 text-center">
                    <span className="text-muted-foreground">High (dozens of features)</span>
                  </td>
                  <td className="p-5 text-center bg-secondary/50">
                    <span className="text-foreground font-semibold">Simple</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-5 text-foreground/80 font-medium">Setup time</td>
                  <td className="p-5 text-center">
                    <span className="text-muted-foreground">30+ minutes</span>
                  </td>
                  <td className="p-5 text-center bg-secondary/50">
                    <span className="text-foreground font-semibold">2 minutes</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-5 text-foreground/80 font-medium">Cost after 1 year</td>
                  <td className="p-5 text-center">
                    <span className="text-red-500 font-semibold">$588+</span>
                  </td>
                  <td className="p-5 text-center bg-secondary/50">
                    <span className="text-emerald-600 font-bold">$49</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Stop paying rent. Own your feedback board forever.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground tracking-tight mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
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
                title: "Embeddable Widget",
                description: "Add a feedback button to your site with a simple code snippet.",
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
              <div key={i} className="bg-card rounded-2xl p-8 border border-border">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-5">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground tracking-tight mb-4">
              Loved by product teams
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              See what teams are saying about LeanVote.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "We used to guess what to build next. Now our users tell us exactly what they need, and we can actually prioritize based on votes.",
                name: "Sarah Mitchell",
                role: "Founder, Tidyforms",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
              },
              {
                quote: "Set up our feedback board in 10 minutes. Our beta users immediately started voting and we shipped the #1 request within a week.",
                name: "Marcus Chen",
                role: "Indie Maker",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
              },
              {
                quote: "The public roadmap reduced our support tickets by half. Users stopped asking 'when will X be ready?' because they can see it themselves.",
                name: "Emily Rodriguez",
                role: "Co-founder, Stackwise",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
              },
              {
                quote: "Finally a feedback tool that doesn't try to do everything. Simple voting, clean UI, and it just works. Exactly what I needed.",
                name: "James Park",
                role: "Solo Founder",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
              },
              {
                quote: "Feedback used to get lost in Slack threads and email. Now everything is in one place and my users actually enjoy submitting ideas.",
                name: "Priya Sharma",
                role: "Product Manager, Flowbase",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
              },
              {
                quote: "Love the changelog feature. Every time we ship something users requested, they get notified. Great for building trust with our community.",
                name: "Tom Anderson",
                role: "Founder, Devkit",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
              },
            ].map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div>
              <p className="text-3xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Feedback boards</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">12k+</p>
              <p className="text-sm text-muted-foreground">Feature requests</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">98%</p>
              <p className="text-sm text-muted-foreground">Happy customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground">
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
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-heading font-bold text-xl flex items-center justify-center mx-auto mb-5">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-muted/50">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground tracking-tight mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              One price, lifetime access. No subscriptions.
            </p>
            <p className="text-sm text-emerald-600 mt-3 font-medium">
              ✓ Voting and submitting feedback is always free
            </p>
          </div>
          
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-secondary-foreground text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Lifetime Deal
            </div>
            
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-bold text-foreground">$49</span>
              <span className="text-muted-foreground">one-time</span>
            </div>
            <p className="text-muted-foreground mb-8">Pay once, own it forever</p>
            
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
                <li key={feature} className="flex items-center gap-3 text-foreground/80">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <Link 
              href="/auth/login"
              className="block w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:bg-primary/90 transition-colors text-lg"
            >
              Create Free Board
            </Link>
            <p className="text-sm text-muted-foreground mt-3">
              Start free, upgrade when ready
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-background tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-background/60 mb-8">
            Create your feedback board in minutes. Upgrade to Lifetime whenever you&apos;re ready.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link 
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-lg px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02]"
            >
              Create Free Board
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-background/40">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-foreground">LeanVote</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LeanVote
          </p>
        </div>
      </footer>
    </div>
  );
}
