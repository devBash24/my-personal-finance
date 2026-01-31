"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import {
  getLoginErrorMessage,
  getSignupErrorMessage,
} from "@/lib/auth-error-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFeatures } from "@/components/auth-features";

type View = "welcome" | "login" | "signup";

export default function HomePage() {
  const router = useRouter();
  const [view, setView] = useState<View>("welcome");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.currentTarget;
      const email = (form.elements.namedItem("email") as HTMLInputElement).value;
      const password = (form.elements.namedItem("password") as HTMLInputElement).value;

      const { error: err } = await authClient.signIn.email({ email, password });

      if (err) {
        toast.error(getLoginErrorMessage(err.message));
        return;
      }
      const ensureRes = await fetch("/api/ensure-profile");
      if (!ensureRes.ok) {
        if (ensureRes.status === 403) {
          await authClient.signOut();
          toast.error("This account has been deleted.");
          return;
        }
        toast.error("Something went wrong. Please try again.");
        return;
      }
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(getLoginErrorMessage(message));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.currentTarget;
      const name = (form.elements.namedItem("name") as HTMLInputElement).value;
      const email = (form.elements.namedItem("email") as HTMLInputElement).value;
      const password = (form.elements.namedItem("password") as HTMLInputElement).value;

      const { error: err } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (err) {
        toast.error(getSignupErrorMessage(err.message));
        return;
      }
      const ensureRes = await fetch("/api/ensure-profile");
      if (!ensureRes.ok) {
        if (ensureRes.status === 403) {
          await authClient.signOut();
          toast.error("This account has been deleted.");
          return;
        }
        toast.error("Something went wrong. Please try again.");
        return;
      }
      toast.success("Account created! Welcome aboard.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(getSignupErrorMessage(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Features */}
      <aside className="hidden w-full flex-col border-r border-border bg-muted/20 lg:flex lg:max-w-[55%] lg:flex-shrink-0">
        <AuthFeatures
          welcomeText="Get started"
          tagline="Start managing your finance faster and better."
        />
      </aside>
      {/* Right: CTAs or forms */}
      <main className="flex w-full flex-1 flex-col items-center justify-center p-6 sm:p-8 lg:p-12 overflow-hidden">
        <div
          key={view}
          className="w-full max-w-sm space-y-6 animate-in fade-in slide-in-from-right-2 duration-300"
        >
          {view === "welcome" && (
            <>
              <div className="space-y-1 text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome!
                </h1>
                <p className="text-muted-foreground">
                  Start managing your finance faster and better.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setView("signup")}
                >
                  Get started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setView("login")}
                >
                  Log in
                </Button>
              </div>
            </>
          )}

          {view === "login" && (
            <>
              <div className="space-y-1 text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back!
                </h1>
                <p className="text-muted-foreground">
                  Start managing your finance faster and better.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="At least 8 characters"
                      required
                      autoComplete="current-password"
                      disabled={loading}
                      className="pl-9"
                      minLength={8}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Log in"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("signup")}
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          )}

          {view === "signup" && (
            <>
              <div className="space-y-1 text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Create account
                </h1>
                <p className="text-muted-foreground">
                  Start managing your finance faster and better.
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      required
                      autoComplete="name"
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="At least 8 characters"
                      required
                      autoComplete="new-password"
                      disabled={loading}
                      className="pl-9"
                      minLength={8}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Creating account…" : "Sign up"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="font-medium text-primary hover:underline"
                >
                  Log in
                </button>
              </p>
            </>
          )}

          <p className="block text-center text-xs text-muted-foreground lg:hidden">
            My Personal Finance
          </p>
        </div>
      </main>
    </div>
  );
}
