"use client";

import { useMonthStore } from "@/store/useMonthStore";
import { Button } from "@/components/ui/button";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MonthPicker() {
  const { month, year, setMonthYear } = useMonthStore();

  function prev() {
    if (month === 1) setMonthYear(12, year - 1);
    else setMonthYear(month - 1, year);
  }

  function next() {
    if (month === 12) setMonthYear(1, year + 1);
    else setMonthYear(month + 1, year);
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={prev}
        aria-label="Previous month"
        className="h-9 w-9 touch-manipulation sm:h-8 sm:w-8"
      >
        ←
      </Button>
      <span className="min-w-[100px] text-center text-xs font-medium sm:min-w-[140px] sm:text-sm">
        {MONTHS[month - 1]} {year}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={next}
        aria-label="Next month"
        className="h-9 w-9 touch-manipulation sm:h-8 sm:w-8"
      >
        →
      </Button>
    </div>
  );
}
