"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  PieChart,
  Plus,
  Target,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFeaturesProps {
  welcomeText?: string;
  tagline?: string;
}

const FEATURE_SLIDES = [
  {
    id: "balance",
    title: "Track your balance",
    description: "See your current balance and net worth at a glance.",
    visual: (
      <div className="relative w-[85%] rounded-xl border border-border bg-card p-4 shadow-lg">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Current balance
        </p>
        <p className="text-2xl font-bold text-primary lg:text-3xl">$24,359</p>
        <Wallet className="absolute right-3 top-3 size-6 text-muted-foreground/60" />
      </div>
    ),
  },
  {
    id: "analytics",
    title: "Spending breakdown",
    description: "Visualize where your money goes with charts and categories.",
    visual: (
      <div className="relative w-[75%] rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-primary/30 bg-primary/10">
            <span className="text-xs font-semibold text-primary">34%</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Food</p>
            <p className="text-sm font-medium">Spending breakdown</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1">
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-orange-400" />
          <div className="h-1.5 flex-1 rounded-full bg-emerald-500" />
          <div className="h-1.5 flex-1 rounded-full bg-rose-400" />
        </div>
        <PieChart className="absolute right-3 top-3 size-5 text-muted-foreground/60" />
      </div>
    ),
  },
  {
    id: "goals",
    title: "Goals & savings",
    description: "Set targets and track progress toward your financial goals.",
    visual: (
      <div className="w-[80%] rounded-xl border border-border bg-card p-4 shadow-lg">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Vacation fund
        </p>
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">$2,400</span>
          <span className="text-sm text-muted-foreground">/ $5,000</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: "48%" }}
          />
        </div>
        <Target className="absolute right-3 top-3 size-5 text-muted-foreground/60" />
      </div>
    ),
  },
  {
    id: "transactions",
    title: "Add transactions",
    description: "Log expenses quickly or import from spreadsheets.",
    visual: (
      <div className="w-[80%] rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-4">
        <div className="flex flex-col items-center justify-center gap-1 py-2">
          <Plus className="size-8 text-primary" />
          <p className="text-sm font-medium">New transaction</p>
          <p className="text-xs text-muted-foreground">or upload .xls file</p>
        </div>
      </div>
    ),
  },
  {
    id: "insights",
    title: "Analytics & insights",
    description: "Charts and trends to understand your finances over time.",
    visual: (
      <div className="relative w-[85%] rounded-xl border border-border bg-card p-4 shadow-lg">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Income vs expenses
        </p>
        <div className="flex h-16 items-end justify-between gap-1">
          {[40, 65, 45, 80, 55, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-primary/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <BarChart3 className="absolute right-3 top-3 size-5 text-muted-foreground/60" />
      </div>
    ),
  },
];

export function AuthFeatures({
  welcomeText = "Welcome back!",
  tagline = "Start managing your finance faster and better.",
}: AuthFeaturesProps = {}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex flex-col justify-between p-8 lg:p-12">
      <Link
        href="/"
        className="flex w-fit items-center gap-2 text-lg font-semibold text-foreground"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          M
        </span>
        My Personal Finance
      </Link>

      <div className="my-8 flex flex-1 flex-col justify-center lg:my-12">
        {/* Slider */}
        <div className="relative min-h-[280px] lg:min-h-[300px]">
          {FEATURE_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-x-0 top-0 flex flex-col items-center justify-center transition-opacity duration-500",
                index === currentSlide
                  ? "z-10 opacity-100"
                  : "pointer-events-none z-0 opacity-0"
              )}
            >
              <div className="relative mx-auto flex min-h-[140px] w-full max-w-[280px] items-center justify-center lg:max-w-[320px]">
                {slide.visual}
              </div>
              <div className="mt-6 space-y-1 text-center">
                <h2 className="text-lg font-semibold">{slide.title}</h2>
                <p className="max-w-[260px] text-sm text-muted-foreground">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
            {welcomeText}
          </h2>
          <p className="text-muted-foreground">{tagline}</p>
        </div>

        {/* Slider controls */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentSlide(
                (prev) =>
                  (prev - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length
              )
            }
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex gap-1.5">
            {FEATURE_SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  index === currentSlide
                    ? "bg-primary"
                    : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide ? "true" : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % FEATURE_SLIDES.length)
            }
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} My Personal Finance. All rights reserved.
      </p>
    </div>
  );
}
