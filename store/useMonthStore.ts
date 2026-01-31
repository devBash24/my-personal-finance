import { create } from "zustand";

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

interface MonthState {
  month: number;
  year: number;
  setMonth: (m: number) => void;
  setYear: (y: number) => void;
  setMonthYear: (m: number, y: number) => void;
}

export const useMonthStore = create<MonthState>()((set) => {
  const { month, year } = getCurrentMonthYear();
  return {
    month,
    year,
    setMonth: (month) => set({ month }),
    setYear: (year) => set({ year }),
    setMonthYear: (month, year) => set({ month, year }),
  };
});
