"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  Target,
  PiggyBank,
  CreditCard,
  Receipt,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/income", label: "Income", icon: Wallet },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/savings", label: "Savings", icon: PiggyBank },
  { href: "/dashboard/debts", label: "Debts", icon: CreditCard },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-background sm:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex w-full">
        {NAV.map(({ href, label, icon: Icon }) => {
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
                "flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] transition-colors touch-manipulation",
                isActive ? "text-primary font-medium" : "text-muted-foreground",
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="truncate w-full text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
