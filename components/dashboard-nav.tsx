"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MonthPicker } from "@/components/month-picker";
import { UserNav } from "@/components/user-nav";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/income", label: "Income" },
  { href: "/dashboard/goals", label: "Goals" },
  { href: "/dashboard/savings", label: "Savings" },
  { href: "/dashboard/debts", label: "Debts" },
  { href: "/dashboard/expenses", label: "Expenses" },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-14 min-w-0 w-full items-center gap-2 px-3 sm:gap-4 sm:px-4 lg:px-6">
        <Link
          href="/dashboard"
          className="shrink-0 truncate font-semibold text-foreground sm:max-w-[180px]"
          aria-label="My Personal Finance home"
        >
          <span className="hidden sm:inline">My Personal Finance</span>
          <span className="sm:hidden">Finance</span>
        </Link>
        <nav
          className="hidden min-w-0 flex-1 gap-6 sm:flex sm:overflow-visible [-webkit-overflow-scrolling:touch]"
          aria-label="Main navigation"
        >
          {NAV.map(({ href, label }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === href
                : pathname === href ||
                  pathname.startsWith(`${href}/`) ||
                  pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "shrink-0 whitespace-nowrap py-1 text-sm transition-colors touch-manipulation",
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {pathname !== "/dashboard" && pathname !== "/dashboard/analytics" && (
            <MonthPicker />
          )}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
