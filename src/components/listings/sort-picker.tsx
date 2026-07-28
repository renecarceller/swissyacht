"use client";

import { Anchor, CalendarDays, Check, CircleGauge, Ruler, Speaker, Tag, X } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import type { ListingFilters } from "@/types/domain";

type SortValue = NonNullable<ListingFilters["sort"]>;

const sortOptions: {
  value: SortValue;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: Record<string, string>;
}[] = [
  { value: "date_desc", icon: Speaker, label: { fr: "Recommandé", de: "Empfohlen", it: "Consigliato", en: "Recommended" } },
  { value: "price_asc", icon: Tag, label: { fr: "Prix: bas", de: "Preis: niedrig", it: "Prezzo: basso", en: "Price: low" } },
  { value: "price_desc", icon: Tag, label: { fr: "Prix: élevé", de: "Preis: hoch", it: "Prezzo: alto", en: "Price: high" } },
  { value: "length_asc", icon: Ruler, label: { fr: "Longueur: courte", de: "Länge: kurz", it: "Lunghezza: corta", en: "Length: short" } },
  { value: "length_desc", icon: Ruler, label: { fr: "Longueur: longue", de: "Länge: lang", it: "Lunghezza: lunga", en: "Length: long" } },
  { value: "year_asc", icon: CalendarDays, label: { fr: "Année: ancienne", de: "Jahr: alt", it: "Anno: vecchio", en: "Year: old" } },
  { value: "year_desc", icon: CalendarDays, label: { fr: "Année: nouvelle", de: "Jahr: neu", it: "Anno: nuovo", en: "Year: new" } },
  { value: "brand_asc", icon: Anchor, label: { fr: "Marque, modèle: A-Z", de: "Marke, Modell: A-Z", it: "Marca, modello: A-Z", en: "Make, model: A-Z" } },
  { value: "brand_desc", icon: Anchor, label: { fr: "Marque, modèle: Z-A", de: "Marke, Modell: Z-A", it: "Marca, modello: Z-A", en: "Make, model: Z-A" } },
  { value: "power_asc", icon: CircleGauge, label: { fr: "Puissance: faible", de: "Leistung: niedrig", it: "Potenza: bassa", en: "Power: low" } },
  { value: "power_desc", icon: CircleGauge, label: { fr: "Puissance: élevée", de: "Leistung: hoch", it: "Potenza: alta", en: "Power: high" } }
];

export function SortPicker({ locale, value }: { locale: string; value: SortValue }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = sortOptions.find((option) => option.value === value) ?? sortOptions[0];
  const labels = sortLabels(locale);

  const applySort = (sort: SortValue) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    router.push(`/boats?${params.toString()}`);
    setOpen(false);
  };

  return (
    <>
      <input type="hidden" name="sort" value={value} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 min-w-56 items-center justify-between gap-4 rounded-md border border-[#cbd7e4] bg-white px-4 text-left text-lg font-semibold text-[#102033] transition focus:outline-none focus:ring-4 focus:ring-[#9cc2ff]"
      >
        <span className="truncate">{current.label[locale] ?? current.label.fr}</span>
        <span className="text-2xl leading-none">⌄</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={labels.title}>
          <div className="max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-[#d6d6d6] px-5 py-4 sm:px-8">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full bg-white text-[#2f3033] transition hover:bg-[#e8e8e8]" aria-label={labels.close}>
                  <X className="size-7" strokeWidth={2.2} />
                </button>
                <h3 className="text-3xl font-semibold text-[#2f3033] sm:text-4xl">{labels.title}</h3>
              </div>
              <button type="button" onClick={() => applySort("date_desc")} className="text-xl font-semibold text-[#adadb0] transition hover:text-[#555] sm:text-2xl">
                {labels.reset}
              </button>
            </div>

            <div className="max-h-[calc(92vh-88px)] overflow-y-auto px-5 py-2 sm:px-8">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                const selected = value === option.value;
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => applySort(option.value)}
                    className="grid w-full grid-cols-[44px_1fr_32px] items-center gap-4 py-4 text-left text-[#2f3033] transition hover:text-[#0f6fae] sm:grid-cols-[56px_1fr_40px] sm:py-5"
                  >
                    <Icon className="size-8 sm:size-10" strokeWidth={2.2} />
                    <span className="truncate text-2xl font-semibold sm:text-3xl">{option.label[locale] ?? option.label.fr}</span>
                    {selected ? <Check className="size-7 text-[#0f6fae] sm:size-8" strokeWidth={2.8} /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function sortLabels(locale: string) {
  const dictionary = {
    fr: { title: "Trier par", reset: "Réinitialiser", close: "Fermer" },
    de: { title: "Sortieren nach", reset: "Zurücksetzen", close: "Schließen" },
    it: { title: "Ordina per", reset: "Reimposta", close: "Chiudi" },
    en: { title: "Sort by", reset: "Reset", close: "Close" }
  };

  return dictionary[locale as keyof typeof dictionary] ?? dictionary.fr;
}
