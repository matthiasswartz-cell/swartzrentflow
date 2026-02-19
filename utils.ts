import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("active") || s.includes("available") || s.includes("current"))
    return "text-brand-green bg-brand-green/10 border-brand-green/30";
  if (s.includes("late") || s.includes("delinq") || s.includes("safe") || s.includes("warn"))
    return "text-brand-yellow bg-brand-yellow/10 border-brand-yellow/30";
  if (s.includes("collect") || s.includes("repo") || s.includes("closed"))
    return "text-brand-red bg-brand-red/10 border-brand-red/30";
  return "text-brand-accent bg-brand-accent/10 border-brand-accent/30";
}
