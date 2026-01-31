"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Palette, Trash2, Check } from "lucide-react";
import { useThemeStore, THEMES } from "@/store/useThemeStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const THEME_GRADIENTS: Record<(typeof THEMES)[number]["id"], string> = {
  light: "from-zinc-100 via-zinc-50 to-white",
  dark: "from-zinc-800 via-zinc-900 to-zinc-950",
  ocean: "from-teal-400 via-cyan-500 to-teal-600",
  forest: "from-emerald-400 via-green-500 to-teal-600",
  sunset: "from-amber-400 via-orange-500 to-rose-500",
  barbie: "from-pink-400 via-fuchsia-500 to-rose-500",
  sky: "from-sky-300 via-blue-400 to-indigo-500",
};

export default function SettingsPage() {
  const router = useRouter();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#delete-account") {
      document.getElementById("delete-account")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  async function handleThemeSelect(id: (typeof THEMES)[number]["id"]) {
    setTheme(id);
    const res = await fetch("/api/user/theme", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: id }),
    });
    if (!res.ok) {
      toast.error("Failed to save theme. Please try again.");
    }
  }

  async function handleDeleteAccount(e?: React.FormEvent) {
    e?.preventDefault();
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to delete account");
        return;
      }
      toast.success("Account deleted");
      setDeleteOpen(false);
      setDeletePassword("");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Customize your app preferences.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-muted-foreground" />
            <CardTitle>Theme</CardTitle>
          </div>
          <CardDescription>
            Choose a color theme for the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {THEMES.map(({ id, label }) => {
              const isSelected = theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleThemeSelect(id)}
                  aria-label={`Select ${label} theme`}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : "border-transparent hover:border-muted-foreground/20 hover:shadow-sm"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-20 w-full items-end justify-end bg-gradient-to-br p-2",
                      THEME_GRADIENTS[id]
                    )}
                  >
                    {isSelected && (
                      <span className="flex size-6 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="border-t border-border bg-card px-3 py-2.5">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card id="delete-account" className="border-destructive/50 scroll-mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="size-5 text-destructive" />
            <CardTitle>Delete account</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="min-h-9 touch-manipulation"
                aria-label="Delete account"
              >
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <form onSubmit={handleDeleteAccount}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all your
                    finance data. Enter your password to confirm. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Label htmlFor="delete-password">Password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Your password"
                    required
                    autoComplete="current-password"
                    disabled={deleting}
                    className="mt-2"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    type="button"
                    onClick={() => setDeletePassword("")}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    type="submit"
                    variant="destructive"
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Delete account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
