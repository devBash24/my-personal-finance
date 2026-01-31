"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset link.");
      return;
    }
    setLoading(true);
    const form = e.currentTarget;
    const newPassword = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    });

    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Failed to reset password.");
      return;
    }
    toast.success("Password reset. You can now log in.");
    router.push("/");
    router.refresh();
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My Personal Finance
        </h1>
        <div className="flex w-full max-w-sm flex-col gap-4 text-center">
          <p className="text-muted-foreground">
            Invalid or expired reset link. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button variant="outline" className="w-full">
              Request new link
            </Button>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        My Personal Finance
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <p className="text-center text-sm text-muted-foreground">
          Enter your new password.
        </p>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            disabled={loading}
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
