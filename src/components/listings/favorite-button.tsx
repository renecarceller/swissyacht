"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const FAVORITES_KEY = "swissyacht.favoriteListingIds";
const FAVORITES_EVENT = "swissyacht:favorites-changed";

export function getFavoriteListingIds() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function setFavoriteListingIds(ids: string[]) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(new Set(ids))));
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
}

export function useFavoriteListingIds() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(getFavoriteListingIds());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(FAVORITES_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(FAVORITES_EVENT, sync);
    };
  }, []);

  return ids;
}

export function FavoriteButton({
  listingId,
  label,
  className = "",
  variant = "card"
}: {
  listingId: string;
  label: string;
  className?: string;
  variant?: "card" | "action";
}) {
  const favoriteIds = useFavoriteListingIds();
  const active = favoriteIds.includes(listingId);

  const toggleFavorite = () => {
    const current = getFavoriteListingIds();
    const next = current.includes(listingId)
      ? current.filter((id) => id !== listingId)
      : [...current, listingId];
    setFavoriteListingIds(next);
  };

  if (variant === "action") {
    return (
      <button
        type="button"
        onClick={toggleFavorite}
        aria-pressed={active}
        className={`flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy transition hover:border-[#8bd3ff] hover:bg-[#eef9ff] ${className}`}
      >
        <Heart size={18} className="text-[#8bd3ff]" fill={active ? "currentColor" : "none"} strokeWidth={2.4} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      aria-label={label}
      aria-pressed={active}
      className={`grid size-11 place-items-center rounded-full bg-white/95 text-[#8bd3ff] shadow-md ring-1 ring-black/5 transition hover:scale-105 hover:bg-white ${className}`}
    >
      <Heart className="size-6" fill={active ? "currentColor" : "none"} strokeWidth={2.5} />
    </button>
  );
}
