"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { signInWithGitHub, signInWithGoogle, signInWithEmail, signUpWithEmail, getUserRedirect } from "@/lib/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get redirect param if user came from a specific page (e.g., a board)
  const redirectTo = searchParams.get("redirect") || "";
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const result = await signUpWithEmail(email, password, fullName);
        if (result.error) {
          setError(result.error);
        } else {
          setMessage("Check your email for a confirmation link!");
        }
      } else {
        const result = await signInWithEmail(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          // Determine the correct redirect based on user type and intended destination
          const redirect = await getUserRedirect(redirectTo || undefined);
          router.push(redirect);
          router.refresh();
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#fff5f2] via-[#ffebe5] to-[#ffd4c9] relative overflow-hidden">
        {/* Animated floating shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#f97352]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-20 w-80 h-80 bg-[#f97352]/15 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/40 rounded-full blur-2xl animate-float" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#f97352] flex items-center justify-center shadow-lg shadow-[#f97352]/25 mb-6">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-heading font-bold text-4xl text-gray-900 leading-tight mb-4">
              Build products your<br />
              <span className="text-[#f97352]">customers love</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Collect feedback, prioritize features, and keep your users in the loop with a simple feedback board.
            </p>
          </div>
          
          {/* Testimonial or stats */}
          <div className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 max-w-md">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white" />
                ))}
              </div>
              <span className="text-sm text-gray-600">Join 500+ teams</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              &ldquo;LeanVote helped us prioritize what our customers actually want. Our feature adoption increased by 40%.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#f97352] flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-gray-900">LeanVote</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="font-heading text-2xl font-semibold text-gray-900">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-gray-500 mt-2">
              {isSignUp ? "Sign up to submit and vote on feedback" : "Sign in to your account"}
            </p>
          </div>

          <div className="space-y-3">
            <form action={() => signInWithGitHub(redirectTo || undefined)}>
              <Button type="submit" variant="outline" className="w-full h-11 justify-center gap-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </Button>
            </form>
            <form action={() => signInWithGoogle(redirectTo || undefined)}>
              <Button type="submit" variant="outline" className="w-full h-11 justify-center gap-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </form>
          </div>

          <div className="relative my-6">
            <Separator className="bg-gray-200" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
              or
            </span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="h-11 border-gray-200 focus:border-[#f97352] focus:ring-[#f97352]/20"
                  required={isSignUp}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 border-gray-200 focus:border-[#f97352] focus:ring-[#f97352]/20"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                className="h-11 border-gray-200 focus:border-[#f97352] focus:ring-[#f97352]/20"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {message && (
              <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{message}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#f97352] hover:bg-[#e8634a] text-white font-medium transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </span>
              ) : (
                isSignUp ? "Create account" : "Sign in"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-[#f97352] font-medium hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          <p className="text-center text-xs text-emerald-600 mt-4 bg-emerald-50 py-2 px-3 rounded-lg">
            ✓ Voting and submitting feedback is always free
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#f97352] rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
