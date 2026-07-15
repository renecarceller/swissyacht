import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatChf(value: number) {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0
  }).format(value);
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function compactSearchParams(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) {
      continue;
    }
    searchParams.set(key, String(value));
  }

  return searchParams.toString();
}
