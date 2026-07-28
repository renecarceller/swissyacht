"use client";

import { useMemo, useState } from "react";
import { Anchor, Bath, BedDouble, CalendarDays, Check, ChevronRight, CircleGauge, CookingPot, Fuel, MapPin, Moon, Palette, Ruler, Sailboat, Search, ShipWheel, SlidersHorizontal, Tag, Users, Waves, X, Zap } from "lucide-react";
import { categories, brands, conditions, engineTypes, exteriorColors, fuelTypes, lakes, popularBrands } from "@/lib/data/reference";
import { refLabel, ui } from "@/i18n/ui";

export function QuickSearch({
  locale,
  brandCounts = {},
  categoryCounts = {},
  rangeHistograms = defaultRangeHistograms,
  initialValues = {}
}: {
  locale: string;
  brandCounts?: Record<string, number>;
  categoryCounts?: Record<string, number>;
  rangeHistograms?: RangeHistograms;
  initialValues?: Record<string, string | undefined>;
}) {
  const text = ui(locale);
  const tabs = [
    { label: text.search.motorTab, value: "Motor boats", icon: ShipWheel, active: true },
    { label: text.search.sailTab, value: "Sailing boats", icon: Sailboat },
    { label: text.search.yachtTab, value: "Yachts", icon: Anchor },
    { label: text.search.electricTab, value: "Electric boats", icon: Zap }
  ];
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterValues>({
    lake: initialValues.lake || "",
    condition: initialValues.condition || "",
    peopleCapacityMin: initialValues.peopleCapacityMin || "",
    cabinsMin: initialValues.cabinsMin || "",
    berthsMin: initialValues.berthsMin || "",
    bathroomsMin: initialValues.bathroomsMin || "",
    kitchen: initialValues.kitchen === "true" || initialValues.kitchen === "1",
    color: initialValues.color || "",
    overnightAccommodation: initialValues.overnightAccommodation === "true" || initialValues.overnightAccommodation === "1"
  });

  return (
    <form action={`/${locale}/boats`} className="overflow-hidden bg-white text-[#2f3033] min-[520px]:rounded-lg min-[520px]:border min-[520px]:border-[#d8d8d8] min-[520px]:shadow-2xl">
      <div className="flex items-center justify-between px-4 pb-2 pt-6 min-[520px]:hidden">
        <h2 className="text-4xl font-semibold tracking-normal">{text.common.search}</h2>
        <a href={`/${locale}`} className="text-2xl font-semibold text-[#0f6fae] transition hover:text-[#06233f]">
          {text.search.clear}
        </a>
      </div>

      <div className="flex gap-7 overflow-x-auto border-b border-[#cfcfcf] px-4 min-[520px]:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <label key={tab.value} className={`flex shrink-0 cursor-pointer items-center gap-2 border-b-[4px] py-4 text-xl font-semibold ${tab.active ? "border-[#333] text-[#333]" : "border-transparent text-[#777]"}`}>
              <input type="radio" name="categoryTab" value={tab.value} defaultChecked={tab.active} className="sr-only" />
              <Icon className="size-7" strokeWidth={2.2} />
              {tab.label}
            </label>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 min-[520px]:grid-cols-4 min-[520px]:gap-3 min-[520px]:p-3 xl:gap-3 xl:p-4">
        <MakeModelField locale={locale} label={text.search.makeModel} modelLabel={text.search.model} brandLabel={text.common.brand} brandCounts={brandCounts} initialBrand={initialValues.brand || ""} initialModel={initialValues.model || ""} />
        <YearRangeField locale={locale} label={text.common.year} histogram={rangeHistograms.year} initialMin={numberParam(initialValues, "yearMin", 1900)} initialMax={numberParam(initialValues, "yearMax", 2026)} />
        <LengthRangeField locale={locale} label={text.search.length} histogram={rangeHistograms.length} initialMin={numberParam(initialValues, "lengthMin", 0)} initialMax={numberParam(initialValues, "lengthMax", 40)} />
        <PriceRangeField locale={locale} label={text.common.price} histogram={rangeHistograms.price} initialMin={numberParam(initialValues, "priceMin", 0)} initialMax={numberParam(initialValues, "priceMax", 1000000)} />

        <BoatTypeField locale={locale} label={text.search.boatType} categoryCounts={categoryCounts} initialCategory={initialValues.category || ""} />

        <SearchSelect icon={<Fuel />} label={text.search.fuel} name="fuelType" initialValue={initialValues.fuelType || ""}>
          <option value="">{text.search.fuel}</option>
          {fuelTypes.map((fuel) => <option key={fuel} value={fuel}>{refLabel(locale, fuel)}</option>)}
        </SearchSelect>

        <SearchSelect icon={<ShipWheel />} label={text.search.engineType} name="engineType" initialValue={initialValues.engineType || ""}>
          <option value="">{text.search.engineType}</option>
          {engineTypes.map((engine) => <option key={engine} value={engine}>{refLabel(locale, engine)}</option>)}
        </SearchSelect>

        <SearchInput icon={<CircleGauge />} label={text.search.enginePower} name="powerMin" type="number" min="0" initialValue={initialValues.powerMin || ""} />
      </div>

      <div className="grid gap-3 px-4 pb-4 min-[520px]:grid-cols-2 min-[520px]:px-3 min-[520px]:pb-3 xl:px-4 xl:pb-4">
        {advancedFilterInputs(advancedFilters)}
        <button type="button" onClick={() => setAdvancedOpen(true)} className="flex h-14 items-center justify-center gap-3 rounded-md border-2 border-[#333] bg-white text-xl font-semibold transition hover:bg-[#f4f4f4] min-[520px]:h-14 min-[520px]:text-xl xl:h-16 xl:text-xl">
          <SlidersHorizontal className="size-7" />
          {text.search.moreFilters}
        </button>
        <button className="h-16 rounded-md bg-[#8bd3ff] text-xl font-extrabold text-[#06233f] shadow-[0_5px_0_#58b9e8] transition hover:bg-[#aee2ff] min-[520px]:h-14 min-[520px]:text-xl xl:h-16 xl:text-xl">
          {text.search.resultCta}
        </button>
      </div>
      {advancedOpen ? (
        <AdvancedFiltersPanel
          locale={locale}
          values={advancedFilters}
          onChange={setAdvancedFilters}
          onClose={() => setAdvancedOpen(false)}
        />
      ) : null}
    </form>
  );
}

type AdvancedFilterValues = {
  lake: string;
  condition: string;
  peopleCapacityMin: string;
  cabinsMin: string;
  berthsMin: string;
  bathroomsMin: string;
  kitchen: boolean;
  color: string;
  overnightAccommodation: boolean;
};

type RangeHistogram = {
  bars: number[];
  counts: number[];
  values: number[];
};

type RangeHistograms = {
  year: RangeHistogram;
  length: RangeHistogram;
  price: RangeHistogram;
};

function advancedFilterInputs(values: AdvancedFilterValues) {
  return (
    <>
      <input type="hidden" name="lake" value={values.lake} />
      <input type="hidden" name="condition" value={values.condition} />
      <input type="hidden" name="peopleCapacityMin" value={values.peopleCapacityMin} />
      <input type="hidden" name="cabinsMin" value={values.cabinsMin} />
      <input type="hidden" name="berthsMin" value={values.berthsMin} />
      <input type="hidden" name="bathroomsMin" value={values.bathroomsMin} />
      <input type="hidden" name="kitchen" value={values.kitchen ? "true" : ""} />
      <input type="hidden" name="color" value={values.color} />
      <input type="hidden" name="overnightAccommodation" value={values.overnightAccommodation ? "true" : ""} />
    </>
  );
}

function AdvancedFiltersPanel({
  locale,
  values,
  onChange,
  onClose
}: {
  locale: string;
  values: AdvancedFilterValues;
  onChange: (values: AdvancedFilterValues) => void;
  onClose: () => void;
}) {
  const text = ui(locale);
  const labels = advancedFilterLabels(locale);
  const [picker, setPicker] = useState<null | "lake" | "condition" | "people" | "cabins" | "berths" | "bathrooms" | "color">(null);
  const clear = () => onChange({
    lake: "",
    condition: "",
    peopleCapacityMin: "",
    cabinsMin: "",
    berthsMin: "",
    bathroomsMin: "",
    kitchen: false,
    color: "",
    overnightAccommodation: false
  });

  const rows = [
    {
      key: "lake" as const,
      icon: <MapPin />,
      label: labels.location,
      value: values.lake ? refLabel(locale, values.lake) : "",
      onClick: () => setPicker("lake")
    },
    {
      key: "condition" as const,
      icon: <Check />,
      label: text.search.condition,
      value: values.condition ? refLabel(locale, values.condition) : "",
      onClick: () => setPicker("condition")
    },
    {
      key: "people" as const,
      icon: <Users />,
      label: labels.people,
      value: values.peopleCapacityMin ? `${values.peopleCapacityMin}+` : "",
      onClick: () => setPicker("people")
    },
    {
      key: "cabins" as const,
      icon: <BedDouble />,
      label: labels.cabins,
      value: values.cabinsMin ? `${values.cabinsMin}+` : "",
      onClick: () => setPicker("cabins")
    },
    {
      key: "berths" as const,
      icon: <Moon />,
      label: labels.berths,
      value: values.berthsMin ? `${values.berthsMin}+` : "",
      onClick: () => setPicker("berths")
    },
    {
      key: "bathrooms" as const,
      icon: <Bath />,
      label: labels.bathrooms,
      value: values.bathroomsMin ? `${values.bathroomsMin}+` : "",
      onClick: () => setPicker("bathrooms")
    },
    {
      key: "kitchen" as const,
      icon: <CookingPot />,
      label: labels.kitchen,
      value: values.kitchen ? labels.yes : "",
      onClick: () => onChange({ ...values, kitchen: !values.kitchen })
    },
    {
      key: "color" as const,
      icon: <Palette />,
      label: labels.exteriorColor,
      value: values.color ? refLabel(locale, values.color) : "",
      onClick: () => setPicker("color")
    },
    {
      key: "overnight" as const,
      icon: <Moon />,
      label: labels.overnight,
      value: values.overnightAccommodation ? labels.yes : "",
      onClick: () => onChange({ ...values, overnightAccommodation: !values.overnightAccommodation })
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={text.search.moreFilters}>
      <div className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#d6d6d6] px-5 py-3 sm:px-7 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#2f3033] transition hover:bg-[#e8e8e8]" aria-label={labels.close}>
              <X className="size-6" strokeWidth={2.2} />
            </button>
            <h3 className="truncate text-2xl font-semibold text-[#2f3033] sm:text-3xl">{text.search.moreFilters}</h3>
          </div>
          <button type="button" onClick={clear} className="text-base font-semibold text-[#adadb0] transition hover:text-[#555] sm:text-xl">
            {labels.reset}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-1 sm:px-7">
          <div className="divide-y divide-[#e1e1e1]">
            {rows.map((row) => (
              <button
                type="button"
                key={row.key}
                onClick={row.onClick}
                className="grid w-full grid-cols-[38px_1fr_auto_auto] items-center gap-3 py-4 text-left text-[#2f3033] transition hover:text-[#0f6fae] sm:grid-cols-[48px_1fr_auto_auto] sm:gap-5 sm:py-5"
              >
                <span className="[&>svg]:size-8 sm:[&>svg]:size-9">{row.icon}</span>
                <span className="min-w-0 truncate text-xl font-semibold sm:text-2xl">{row.label}</span>
                {row.value ? <span className="max-w-36 truncate rounded-md bg-[#8bd3ff] px-2.5 py-1 text-base font-bold text-[#06233f] sm:max-w-52 sm:text-lg">{row.value}</span> : null}
                <ChevronRight className="size-6 text-[#999] sm:size-8" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[#d6d6d6] p-4 sm:p-5">
          <button type="button" onClick={onClose} className="h-12 rounded-md border-2 border-[#333] bg-white text-base font-bold text-[#2f3033] sm:h-14 sm:text-xl">
            {labels.close}
          </button>
          <button type="submit" className="h-12 rounded-md bg-[#8bd3ff] text-base font-extrabold text-[#06233f] shadow-[0_4px_0_#58b9e8] transition hover:bg-[#aee2ff] sm:h-14 sm:text-xl">
            {text.search.resultCta}
          </button>
        </div>
      </div>

      {picker === "lake" ? (
        <OptionPicker
          locale={locale}
          title={labels.location}
          options={lakes.map((lake) => ({ value: lake, label: refLabel(locale, lake) }))}
          selected={values.lake}
          onSelect={(lake) => {
            onChange({ ...values, lake });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      ) : null}
      {picker === "condition" ? (
        <OptionPicker
          locale={locale}
          title={text.search.condition}
          options={conditions.map((condition) => ({ value: condition, label: refLabel(locale, condition) }))}
          selected={values.condition}
          onSelect={(condition) => {
            onChange({ ...values, condition });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      ) : null}
      {picker === "color" ? (
        <OptionPicker
          locale={locale}
          title={labels.exteriorColor}
          options={exteriorColors.map((color) => ({ value: color, label: refLabel(locale, color) }))}
          selected={values.color}
          onSelect={(color) => {
            onChange({ ...values, color });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
          colorMode
        />
      ) : null}
      {picker === "people" || picker === "cabins" || picker === "berths" || picker === "bathrooms" ? (
        <NumberChoicePicker
          locale={locale}
          title={picker === "people" ? labels.people : picker === "cabins" ? labels.cabins : picker === "berths" ? labels.berths : labels.bathrooms}
          selected={picker === "people" ? values.peopleCapacityMin : picker === "cabins" ? values.cabinsMin : picker === "berths" ? values.berthsMin : values.bathroomsMin}
          max={picker === "people" ? 12 : 6}
          onSelect={(selected) => {
            onChange({
              ...values,
              peopleCapacityMin: picker === "people" ? selected : values.peopleCapacityMin,
              cabinsMin: picker === "cabins" ? selected : values.cabinsMin,
              berthsMin: picker === "berths" ? selected : values.berthsMin,
              bathroomsMin: picker === "bathrooms" ? selected : values.bathroomsMin
            });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </div>
  );
}

function OptionPicker({
  locale,
  title,
  options,
  selected,
  onSelect,
  onClose,
  colorMode = false
}: {
  locale: string;
  title: string;
  options: Array<{ value: string; label: string }>;
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  colorMode?: boolean;
}) {
  const labels = advancedFilterLabels(locale);

  return (
    <div className="absolute inset-0 z-10 flex items-end bg-black/20 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex max-h-[86vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#d6d6d6] px-5 py-3 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#2f3033] transition hover:bg-[#e8e8e8]" aria-label={labels.close}>
              <X className="size-6" strokeWidth={2.2} />
            </button>
            <h4 className="truncate text-2xl font-semibold text-[#2f3033] sm:text-3xl">{title}</h4>
          </div>
          <button type="button" onClick={() => onSelect("")} className="text-base font-semibold text-[#adadb0] transition hover:text-[#555] sm:text-xl">
            {labels.clear}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-1 sm:px-7">
          <div className="divide-y divide-[#e1e1e1]">
            {options.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => onSelect(option.value)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-4 py-4 text-left text-[#2f3033] transition hover:text-[#0f6fae] sm:py-5"
              >
                <span className="flex min-w-0 items-center gap-4">
                  {colorMode ? <span className="size-7 shrink-0 rounded-full border border-[#999]" style={{ background: colorSwatch(option.value) }} /> : null}
                  <span className="truncate text-xl font-semibold sm:text-2xl">{option.label}</span>
                </span>
                {selected === option.value ? <Check className="size-7 text-[#0f6fae] sm:size-8" /> : <ChevronRight className="size-6 text-[#999] sm:size-8" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberChoicePicker({
  locale,
  title,
  selected,
  max,
  onSelect,
  onClose
}: {
  locale: string;
  title: string;
  selected: string;
  max: number;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const labels = advancedFilterLabels(locale);
  const values = Array.from({ length: max }, (_, index) => String(index + 1));

  return (
    <div className="absolute inset-0 z-10 flex items-end bg-black/20 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#d6d6d6] px-5 py-3 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#2f3033] transition hover:bg-[#e8e8e8]" aria-label={labels.close}>
              <X className="size-6" strokeWidth={2.2} />
            </button>
            <h4 className="truncate text-2xl font-semibold text-[#2f3033] sm:text-3xl">{title}</h4>
          </div>
          <button type="button" onClick={() => onSelect("")} className="text-base font-semibold text-[#adadb0] transition hover:text-[#555] sm:text-xl">
            {labels.clear}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 p-5 sm:grid-cols-4 sm:p-6">
          {values.map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => onSelect(value)}
              className={`h-14 rounded-md border-2 text-xl font-bold transition sm:h-16 sm:text-2xl ${selected === value ? "border-[#0f6fae] bg-[#8bd3ff] text-[#06233f]" : "border-[#d2d2d2] bg-white text-[#2f3033] hover:border-[#0f6fae]"}`}
            >
              {value}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function colorSwatch(color: string) {
  const swatches: Record<string, string> = {
    White: "#ffffff",
    Black: "#111111",
    Blue: "#1d4ed8",
    "Light blue": "#8bd3ff",
    Grey: "#737373",
    Silver: "#c0c0c0",
    Red: "#d11f2f",
    Green: "#138a43",
    Beige: "#d6c4a2",
    Brown: "#7a4a2a",
    Yellow: "#f5d90a",
    Orange: "#f97316"
  };

  return swatches[color] || "#ffffff";
}

function numberParam(values: Record<string, string | undefined>, key: string, fallback: number) {
  const value = values[key];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isHistogramBarSelected(index: number, total: number, minPercent: number, maxPercent: number) {
  if (total <= 1) {
    return true;
  }

  const barPercent = (index / (total - 1)) * 100;
  return barPercent >= minPercent && barPercent <= maxPercent;
}

function selectedHistogramCount(counts: number[], minPercent: number, maxPercent: number) {
  return counts.reduce((total, count, index) => {
    if (!isHistogramBarSelected(index, counts.length, minPercent, maxPercent)) {
      return total;
    }

    return total + count;
  }, 0);
}

function exactRangeCount(values: number[], min: number, max: number) {
  return values.filter((value) => value >= min && value <= max).length;
}

function formatBoatCount(value: number, locale: string) {
  return new Intl.NumberFormat(`${locale}-CH`).format(value);
}

function formatChf(value: number, locale: string) {
  return new Intl.NumberFormat(`${locale}-CH`).format(value);
}

function SearchInput({
  icon,
  label,
  name,
  type = "text",
  initialValue = "",
  ...props
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  type?: string;
  initialValue?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  const [value, setValue] = useState(initialValue);
  const active = value.trim().length > 0;

  return (
    <div className={filterFieldClass(active)}>
      <span className={filterIconClass(active)}>{icon}</span>
      <span className="sr-only">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={label}
        className={filterInputClass(active)}
        {...props}
      />
      {active ? <ClearFilterButton onClick={() => setValue("")} /> : null}
    </div>
  );
}

function SearchSelect({
  icon,
  label,
  name,
  initialValue = "",
  children
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  initialValue?: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = useState(initialValue);
  const active = value.length > 0;

  return (
    <div className={filterFieldClass(active)}>
      <span className={filterIconClass(active)}>{icon}</span>
      <span className="sr-only">{label}</span>
      <select name={name} value={value} onChange={(event) => setValue(event.target.value)} className={filterSelectClass(active)}>
        {children}
      </select>
      {active ? <ClearFilterButton onClick={() => setValue("")} /> : null}
    </div>
  );
}

function BoatTypeField({
  locale,
  label,
  categoryCounts,
  initialCategory = ""
}: {
  locale: string;
  label: string;
  categoryCounts: Record<string, number>;
  initialCategory?: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [open, setOpen] = useState(false);
  const active = selectedCategory.length > 0;
  const display = active ? refLabel(locale, selectedCategory) : label;

  return (
    <div className={filterFieldClass(active)}>
      <span className={filterIconClass(active)}>
        <Waves />
      </span>
      <input type="hidden" name="category" value={selectedCategory} />
      <button type="button" onClick={() => setOpen(true)} className={filterButtonTextClass(active)}>
        {display}
      </button>
      {active ? <ClearFilterButton onClick={() => setSelectedCategory("")} /> : null}
      {open ? (
        <BoatTypePicker
          locale={locale}
          label={label}
          categoryCounts={categoryCounts}
          selectedCategory={selectedCategory}
          onSelect={(category) => {
            setSelectedCategory(category);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function BoatTypePicker({
  locale,
  label,
  categoryCounts,
  selectedCategory,
  onSelect,
  onClose
}: {
  locale: string;
  label: string;
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  onSelect: (category: string) => void;
  onClose: () => void;
}) {
  const labels = boatTypePickerLabels(locale);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <div className="max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-4xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#d6d6d6] px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-white text-[#2f3033] transition hover:bg-[#e8e8e8]" aria-label={labels.close}>
              <X className="size-7" strokeWidth={2.2} />
            </button>
            <h3 className="text-3xl font-semibold text-[#2f3033] sm:text-4xl">{label}</h3>
          </div>
          <button type="button" onClick={() => onSelect("")} className="text-xl font-semibold text-[#0f6fae] transition hover:text-[#06233f] sm:text-2xl">
            {labels.selectAll}
          </button>
        </div>

        <div className="max-h-[calc(92vh-88px)] overflow-y-auto px-5 py-2 sm:px-8">
          <div className="divide-y divide-[#dedede]">
            {categories.map((category) => {
              const selected = selectedCategory === category;
              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => onSelect(category)}
                  className="grid w-full grid-cols-[40px_96px_1fr_auto] items-center gap-3 py-4 text-left text-[#2f3033] transition hover:text-[#0f6fae] sm:grid-cols-[52px_150px_1fr_auto] sm:gap-5 sm:py-6"
                >
                  <span className={`grid size-9 place-items-center rounded-md border-4 sm:size-11 ${selected ? "border-[#0f6fae] bg-[#0f6fae]" : "border-[#999] bg-white"}`}>
                    {selected ? <span className="size-3 rounded-sm bg-white sm:size-4" /> : null}
                  </span>
                  <BoatCategoryDrawing category={category} />
                  <span className="min-w-0 truncate text-2xl font-semibold sm:text-3xl">{refLabel(locale, category)}</span>
                  <span className="text-2xl font-semibold text-[#5f5f5f] sm:text-3xl">{categoryCounts[category] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function filterFieldClass(active: boolean) {
  return [
    "flex min-h-14 items-center gap-2 rounded-md px-3 min-[520px]:min-h-14 min-[520px]:gap-3 min-[520px]:px-3 xl:min-h-16",
    active ? "bg-[#3f3f3f] text-white" : "bg-[#e8e8e8] text-[#626468]"
  ].join(" ");
}

function filterIconClass(active: boolean) {
  return [
    "[&>svg]:size-6 min-[520px]:[&>svg]:size-6 xl:[&>svg]:size-7",
    active ? "text-[#bdbdbd]" : "text-[#999]"
  ].join(" ");
}

function filterInputClass(active: boolean) {
  return [
    "min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none min-[520px]:text-base xl:text-lg",
    active ? "text-white placeholder:text-white/80" : "text-[#626468] placeholder:text-[#626468]"
  ].join(" ");
}

function filterSelectClass(active: boolean) {
  return [
    "min-w-0 flex-1 appearance-none bg-transparent text-lg font-semibold outline-none min-[520px]:text-base xl:text-lg [&>option]:text-[#2f3033]",
    active ? "text-white" : "text-[#626468]"
  ].join(" ");
}

function filterButtonTextClass(active: boolean) {
  return [
    "min-w-0 flex-1 truncate bg-transparent text-left text-lg font-semibold outline-none transition min-[520px]:text-base xl:text-lg",
    active ? "text-white hover:text-white" : "text-[#626468] hover:text-[#1b8ed1]"
  ].join(" ");
}

function ClearFilterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#adadb0] text-[#3f3f3f] transition hover:bg-white min-[520px]:size-9 xl:size-10"
      aria-label="Clear filter"
    >
      <X className="size-6 min-[520px]:size-6 xl:size-7" strokeWidth={3} />
    </button>
  );
}

function YearRangeField({ locale, label, histogram, initialMin = 1900, initialMax = 2026 }: { locale: string; label: string; histogram: RangeHistogram; initialMin?: number; initialMax?: number }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({ min: initialMin, max: initialMax });
  const defaultRange = range.min === 1900 && range.max === 2026;
  const display = defaultRange ? label : `${range.min} - ${range.max}`;

  return (
    <div className={filterFieldClass(!defaultRange)}>
      <span className={filterIconClass(!defaultRange)}>
        <CalendarDays />
      </span>
      <input type="hidden" name="yearMin" value={defaultRange ? "" : range.min} />
      <input type="hidden" name="yearMax" value={defaultRange ? "" : range.max} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={filterButtonTextClass(!defaultRange)}
      >
        {display}
      </button>
      {!defaultRange ? <ClearFilterButton onClick={() => setRange({ min: 1900, max: 2026 })} /> : null}
      {open ? (
        <YearRangePicker
          locale={locale}
          label={label}
          histogram={histogram}
          range={range}
          onChange={setRange}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function LengthRangeField({ locale, label, histogram, initialMin = 0, initialMax = 40 }: { locale: string; label: string; histogram: RangeHistogram; initialMin?: number; initialMax?: number }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({ min: initialMin, max: initialMax });
  const defaultRange = range.min === 0 && range.max === 40;
  const display = defaultRange ? label : `${range.min} m - ${range.max} m`;

  return (
    <div className={filterFieldClass(!defaultRange)}>
      <span className={filterIconClass(!defaultRange)}>
        <Ruler />
      </span>
      <input type="hidden" name="lengthMin" value={defaultRange ? "" : range.min} />
      <input type="hidden" name="lengthMax" value={defaultRange ? "" : range.max} />
      <button type="button" onClick={() => setOpen(true)} className={filterButtonTextClass(!defaultRange)}>
        {display}
      </button>
      {!defaultRange ? <ClearFilterButton onClick={() => setRange({ min: 0, max: 40 })} /> : null}
      {open ? (
        <LengthRangePicker
          locale={locale}
          label={label}
          histogram={histogram}
          range={range}
          onChange={setRange}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function PriceRangeField({ locale, label, histogram, initialMin = 0, initialMax = 1000000 }: { locale: string; label: string; histogram: RangeHistogram; initialMin?: number; initialMax?: number }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({ min: initialMin, max: initialMax });
  const defaultRange = range.min === 0 && range.max === 1000000;
  const display = defaultRange ? label : `CHF ${formatChf(range.min, locale)} - ${formatChf(range.max, locale)}`;

  return (
    <div className={filterFieldClass(!defaultRange)}>
      <span className={filterIconClass(!defaultRange)}>
        <Tag />
      </span>
      <input type="hidden" name="priceMin" value={defaultRange ? "" : range.min} />
      <input type="hidden" name="priceMax" value={defaultRange ? "" : range.max} />
      <button type="button" onClick={() => setOpen(true)} className={filterButtonTextClass(!defaultRange)}>
        {display}
      </button>
      {!defaultRange ? <ClearFilterButton onClick={() => setRange({ min: 0, max: 1000000 })} /> : null}
      {open ? (
        <PriceRangePicker
          locale={locale}
          label={label}
          histogram={histogram}
          range={range}
          onChange={setRange}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function PriceRangePicker({
  locale,
  label,
  histogram,
  range,
  onChange,
  onClose
}: {
  locale: string;
  label: string;
  histogram: RangeHistogram;
  range: { min: number; max: number };
  onChange: (range: { min: number; max: number }) => void;
  onClose: () => void;
}) {
  const labels = pricePickerLabels(locale);
  const minPrice = 0;
  const maxPrice = 1000000;
  const step = 5000;
  const minPercent = ((range.min - minPrice) / (maxPrice - minPrice)) * 100;
  const maxPercent = ((range.max - minPrice) / (maxPrice - minPrice)) * 100;
  const matchingBoats = histogram.values.length ? exactRangeCount(histogram.values, range.min, range.max) : selectedHistogramCount(histogram.counts, minPercent, maxPercent);

  const updateMin = (value: number) => {
    const rounded = Math.round(value / step) * step;
    onChange({ min: Math.min(rounded, range.max - step), max: range.max });
  };
  const updateMax = (value: number) => {
    const rounded = Math.round(value / step) * step;
    onChange({ min: range.min, max: Math.max(rounded, range.min + step) });
  };
  const clear = () => onChange({ min: minPrice, max: maxPrice });

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <div className="max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-4xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#d6d6d6] px-6 py-6 sm:px-10">
          <div className="flex items-center gap-5">
            <button type="button" onClick={onClose} className="grid size-12 place-items-center rounded-full bg-white text-[#2f3033] transition hover:bg-[#e8e8e8]" aria-label={labels.close}>
              <X className="size-9" strokeWidth={2.4} />
            </button>
            <h3 className="text-3xl font-bold text-[#2f3033] sm:text-5xl">{label}</h3>
          </div>
          <button type="button" onClick={clear} className="text-2xl font-bold text-[#adadb0] transition hover:text-[#555] sm:text-5xl">
            {labels.clear}
          </button>
        </div>

        <div className="px-6 py-7 sm:px-10">
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            <NumberBox value={range.min} label={labels.from} onChange={updateMin} min={minPrice} max={range.max - step} step={step} />
            <NumberBox value={range.max} label={labels.to} onChange={updateMax} min={range.min + step} max={maxPrice} step={step} />
          </div>

          <div className="relative mt-12 h-52 border-b border-[#d6d6d6] sm:mt-16 sm:h-64">
            <div className="absolute inset-x-6 bottom-16 flex h-36 items-end gap-1 sm:inset-x-10 sm:h-44">
              {histogram.bars.map((height, index) => {
                const selected = isHistogramBarSelected(index, histogram.bars.length, minPercent, maxPercent);

                return (
                  <span
                    key={index}
                    className={`flex-1 transition-colors ${selected ? "bg-[#333]" : "bg-[#c8c8c8]"}`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
            <div className="absolute inset-x-8 bottom-16 h-px bg-[#aaa] sm:inset-x-14" />
            <div className="absolute inset-x-8 bottom-16 h-1 bg-[#333] sm:inset-x-14" style={{ left: `calc(2rem + ${minPercent * 0.01} * (100% - 4rem))`, right: `calc(2rem + ${(100 - maxPercent) * 0.01} * (100% - 4rem))` }} />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={step}
              value={range.min}
              onChange={(event) => updateMin(Number(event.target.value))}
              aria-label={labels.from}
              className="year-range absolute inset-x-0 bottom-10 z-20 w-full"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={step}
              value={range.max}
              onChange={(event) => updateMax(Number(event.target.value))}
              aria-label={labels.to}
              className="year-range absolute inset-x-0 bottom-10 z-30 w-full"
            />
          </div>

          <div className="mt-2">
            <h4 className="mb-5 text-2xl font-bold text-[#2f3033] sm:text-4xl">{labels.recent}</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { label: labels.until100k, min: minPrice, max: 100000 },
                { label: "100’000 - 250’000", min: 100000, max: 250000 },
                { label: "250’000 - 500’000", min: 250000, max: 500000 },
                { label: labels.from500k, min: 500000, max: maxPrice }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange({ min: preset.min, max: preset.max })}
                  className="shrink-0 rounded-full border-2 border-[#d2d2d2] px-6 py-3 text-xl font-bold text-[#555] transition hover:border-[#1b8ed1] hover:text-[#1b8ed1] sm:text-3xl"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr] items-center gap-4 border-t border-[#d6d6d6] px-6 py-5 sm:px-10">
          <div>
            <p className="text-3xl font-bold text-[#2f3033] sm:text-5xl">{formatBoatCount(matchingBoats, locale)} {labels.boats}</p>
            <p className="mt-1 text-sm font-semibold text-[#6f6f72] sm:text-xl">CHF {formatChf(range.min, locale)} - {formatChf(range.max, locale)}</p>
          </div>
          <button type="button" onClick={onClose} className="h-16 rounded-md bg-[#8bd3ff] text-3xl font-extrabold text-[#06233f] shadow-[0_5px_0_#58b9e8] transition hover:bg-[#aee2ff] sm:h-24 sm:text-5xl">
            {labels.apply}
          </button>
        </div>
      </div>
    </div>
  );
}

function LengthRangePicker({
  locale,
  label,
  histogram,
  range,
  onChange,
  onClose
}: {
  locale: string;
  label: string;
  histogram: RangeHistogram;
  range: { min: number; max: number };
  onChange: (range: { min: number; max: number }) => void;
  onClose: () => void;
}) {
  const labels = lengthPickerLabels(locale);
  const minLength = 0;
  const maxLength = 40;
  const minPercent = ((range.min - minLength) / (maxLength - minLength)) * 100;
  const maxPercent = ((range.max - minLength) / (maxLength - minLength)) * 100;
  const matchingBoats = histogram.values.length ? exactRangeCount(histogram.values, range.min, range.max) : selectedHistogramCount(histogram.counts, minPercent, maxPercent);

  const updateMin = (value: number) => onChange({ min: Math.min(value, range.max - 1), max: range.max });
  const updateMax = (value: number) => onChange({ min: range.min, max: Math.max(value, range.min + 1) });
  const clear = () => onChange({ min: minLength, max: maxLength });

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <div className="max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-4xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#d6d6d6] px-6 py-6 sm:px-10">
          <div className="flex items-center gap-5">
            <button type="button" onClick={onClose} className="grid size-12 place-items-center rounded-full bg-white text-[#2f3033] transition hover:bg-[#e8e8e8]" aria-label={labels.close}>
              <X className="size-9" strokeWidth={2.4} />
            </button>
            <h3 className="text-3xl font-bold text-[#2f3033] sm:text-5xl">{label}</h3>
          </div>
          <button type="button" onClick={clear} className="text-2xl font-bold text-[#adadb0] transition hover:text-[#555] sm:text-5xl">
            {labels.clear}
          </button>
        </div>

        <div className="px-6 py-7 sm:px-10">
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            <NumberBox value={range.min} label={labels.from} onChange={updateMin} min={minLength} max={range.max - 1} suffix="m" />
            <NumberBox value={range.max} label={labels.to} onChange={updateMax} min={range.min + 1} max={maxLength} suffix="m" />
          </div>

          <div className="relative mt-12 h-52 border-b border-[#d6d6d6] sm:mt-16 sm:h-64">
            <div className="absolute inset-x-6 bottom-16 flex h-36 items-end gap-1 sm:inset-x-10 sm:h-44">
              {histogram.bars.map((height, index) => {
                const selected = isHistogramBarSelected(index, histogram.bars.length, minPercent, maxPercent);

                return (
                  <span
                    key={index}
                    className={`flex-1 transition-colors ${selected ? "bg-[#333]" : "bg-[#c8c8c8]"}`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
            <div className="absolute inset-x-8 bottom-16 h-px bg-[#aaa] sm:inset-x-14" />
            <div className="absolute inset-x-8 bottom-16 h-1 bg-[#333] sm:inset-x-14" style={{ left: `calc(2rem + ${minPercent * 0.01} * (100% - 4rem))`, right: `calc(2rem + ${(100 - maxPercent) * 0.01} * (100% - 4rem))` }} />
            <input
              type="range"
              min={minLength}
              max={maxLength}
              value={range.min}
              onChange={(event) => updateMin(Number(event.target.value))}
              aria-label={labels.from}
              className="year-range absolute inset-x-0 bottom-10 z-20 w-full"
            />
            <input
              type="range"
              min={minLength}
              max={maxLength}
              value={range.max}
              onChange={(event) => updateMax(Number(event.target.value))}
              aria-label={labels.to}
              className="year-range absolute inset-x-0 bottom-10 z-30 w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr] items-center gap-4 border-t border-[#d6d6d6] px-6 py-5 sm:px-10">
          <div>
            <p className="text-3xl font-bold text-[#2f3033] sm:text-5xl">{formatBoatCount(matchingBoats, locale)} {labels.boats}</p>
            <p className="mt-1 text-sm font-semibold text-[#6f6f72] sm:text-xl">{range.min} - {range.max} m</p>
          </div>
          <button type="button" onClick={onClose} className="h-16 rounded-md bg-[#8bd3ff] text-3xl font-extrabold text-[#06233f] shadow-[0_5px_0_#58b9e8] transition hover:bg-[#aee2ff] sm:h-24 sm:text-5xl">
            {labels.apply}
          </button>
        </div>
      </div>
    </div>
  );
}

function YearRangePicker({
  locale,
  label,
  histogram,
  range,
  onChange,
  onClose
}: {
  locale: string;
  label: string;
  histogram: RangeHistogram;
  range: { min: number; max: number };
  onChange: (range: { min: number; max: number }) => void;
  onClose: () => void;
}) {
  const labels = yearPickerLabels(locale);
  const minYear = 1900;
  const maxYear = 2026;
  const minPercent = ((range.min - minYear) / (maxYear - minYear)) * 100;
  const maxPercent = ((range.max - minYear) / (maxYear - minYear)) * 100;
  const matchingBoats = histogram.values.length ? exactRangeCount(histogram.values, range.min, range.max) : selectedHistogramCount(histogram.counts, minPercent, maxPercent);

  const updateMin = (value: number) => onChange({ min: Math.min(value, range.max - 1), max: range.max });
  const updateMax = (value: number) => onChange({ min: range.min, max: Math.max(value, range.min + 1) });
  const clear = () => onChange({ min: minYear, max: maxYear });

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <div className="max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-4xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#d6d6d6] px-6 py-6 sm:px-10">
          <div className="flex items-center gap-5">
            <button type="button" onClick={onClose} className="grid size-12 place-items-center rounded-full bg-white text-[#2f3033] transition hover:bg-[#e8e8e8]" aria-label={labels.close}>
              <X className="size-9" strokeWidth={2.4} />
            </button>
            <h3 className="text-3xl font-bold text-[#2f3033] sm:text-5xl">{label}</h3>
          </div>
          <button type="button" onClick={clear} className="text-2xl font-bold text-[#adadb0] transition hover:text-[#555] sm:text-5xl">
            {labels.clear}
          </button>
        </div>

        <div className="px-6 py-7 sm:px-10">
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            <NumberBox value={range.min} label={labels.from} onChange={updateMin} min={minYear} max={range.max - 1} />
            <NumberBox value={range.max} label={labels.to} onChange={updateMax} min={range.min + 1} max={maxYear} />
          </div>

          <div className="relative mt-12 h-52 sm:mt-16 sm:h-64">
            <div className="absolute inset-x-6 bottom-16 flex h-36 items-end gap-1 sm:inset-x-10 sm:h-44">
              {histogram.bars.map((height, index) => {
                const selected = isHistogramBarSelected(index, histogram.bars.length, minPercent, maxPercent);

                return (
                  <span
                    key={index}
                    className={`flex-1 transition-colors ${selected ? "bg-[#333]" : "bg-[#c8c8c8]"}`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
            <div className="absolute inset-x-8 bottom-16 h-px bg-[#aaa] sm:inset-x-14" />
            <div className="absolute inset-x-8 bottom-16 h-1 bg-[#333] sm:inset-x-14" style={{ left: `calc(2rem + ${minPercent * 0.01} * (100% - 4rem))`, right: `calc(2rem + ${(100 - maxPercent) * 0.01} * (100% - 4rem))` }} />
            <input
              type="range"
              min={minYear}
              max={maxYear}
              value={range.min}
              onChange={(event) => updateMin(Number(event.target.value))}
              aria-label={labels.from}
              className="year-range absolute inset-x-0 bottom-10 z-20 w-full"
            />
            <input
              type="range"
              min={minYear}
              max={maxYear}
              value={range.max}
              onChange={(event) => updateMax(Number(event.target.value))}
              aria-label={labels.to}
              className="year-range absolute inset-x-0 bottom-10 z-30 w-full"
            />
          </div>

          <div className="mt-2">
            <h4 className="mb-5 text-2xl font-bold text-[#2f3033] sm:text-4xl">{labels.recent}</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { label: labels.from1980, min: 1980, max: maxYear },
                { label: labels.until2026, min: minYear, max: maxYear },
                { label: "2016 - 2021", min: 2016, max: 2021 },
                { label: "2020 - 2026", min: 2020, max: 2026 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange({ min: preset.min, max: preset.max })}
                  className="shrink-0 rounded-full border-2 border-[#d2d2d2] px-6 py-3 text-xl font-bold text-[#555] transition hover:border-[#1b8ed1] hover:text-[#1b8ed1] sm:text-3xl"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr] items-center gap-4 border-t border-[#d6d6d6] px-6 py-5 sm:px-10">
          <p className="text-3xl font-bold text-[#2f3033] sm:text-5xl">{formatBoatCount(matchingBoats, locale)} {labels.boats}</p>
          <button type="button" onClick={onClose} className="h-16 rounded-md bg-[#8bd3ff] text-3xl font-extrabold text-[#06233f] shadow-[0_5px_0_#58b9e8] transition hover:bg-[#aee2ff] sm:h-24 sm:text-5xl">
            {labels.apply}
          </button>
        </div>
      </div>
    </div>
  );
}

function NumberBox({
  value,
  label,
  min,
  max,
  onChange,
  suffix,
  step = 1
}: {
  value: number;
  label: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-24 w-full rounded-md border-2 border-[#999] bg-white px-7 text-4xl font-bold text-[#999] outline-none focus:border-[#1b8ed1] sm:h-36 sm:text-6xl"
      />
      {suffix ? <span className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 text-3xl font-bold text-[#999] sm:text-5xl">{suffix}</span> : null}
    </label>
  );
}

function MakeModelField({
  locale,
  label,
  brandLabel,
  modelLabel,
  brandCounts,
  initialBrand = "",
  initialModel = ""
}: {
  locale: string;
  label: string;
  brandLabel: string;
  modelLabel: string;
  brandCounts: Record<string, number>;
  initialBrand?: string;
  initialModel?: string;
}) {
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [model, setModel] = useState(initialModel);
  const [open, setOpen] = useState(false);
  const active = selectedBrand.length > 0 || model.trim().length > 0;
  const selectedText = selectedBrand || label;

  return (
    <div className={filterFieldClass(active)}>
      <span className={filterIconClass(active)}>
        <Anchor />
      </span>
      <span className="sr-only">{label}</span>
      <div className="grid min-w-0 flex-1 grid-cols-[1fr_0.85fr] gap-2">
        <input type="hidden" name="brand" value={selectedBrand} />
        <button
          type="button"
          aria-label={brandLabel}
          onClick={() => setOpen(true)}
          className={filterButtonTextClass(active)}
        >
          {selectedText}
        </button>
        <input
          name="model"
          aria-label={modelLabel}
          value={model}
          onChange={(event) => setModel(event.target.value)}
          placeholder={modelLabel}
          className={filterInputClass(active)}
        />
      </div>
      {active ? (
        <ClearFilterButton
          onClick={() => {
            setSelectedBrand("");
            setModel("");
          }}
        />
      ) : null}
      {open ? (
        <BrandPicker
          locale={locale}
          brandLabel={brandLabel}
          brandCounts={brandCounts}
          selectedBrand={selectedBrand}
          onClose={() => setOpen(false)}
          onSelect={(brand) => {
            setSelectedBrand(brand);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function BrandPicker({
  locale,
  brandLabel,
  brandCounts,
  selectedBrand,
  onClose,
  onSelect
}: {
  locale: string;
  brandLabel: string;
  brandCounts: Record<string, number>;
  selectedBrand: string;
  onClose: () => void;
  onSelect: (brand: string) => void;
}) {
  const labels = brandPickerLabels(locale);
  const [query, setQuery] = useState("");
  const allBrands = useMemo(() => {
    return Array.from(new Set([...Object.keys(brandCounts), ...brands])).sort((a, b) => a.localeCompare(b));
  }, [brandCounts]);
  const filteredBrands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allBrands;
    return allBrands.filter((brand) => brand.toLowerCase().includes(normalized));
  }, [allBrands, query]);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={brandLabel}>
      <div className="max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-4xl sm:rounded-3xl">
        <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[#333]" />
        <div className="flex items-center gap-5 px-6 pb-5 pt-8 sm:px-10">
          <button type="button" onClick={onClose} className="grid size-12 place-items-center rounded-full bg-white text-[#2f3033] transition hover:bg-[#e8e8e8]" aria-label={labels.close}>
            <X className="size-9" strokeWidth={2.4} />
          </button>
          <h3 className="text-3xl font-bold text-[#2f3033] sm:text-5xl">{labels.addMake}</h3>
        </div>

        <div className="max-h-[calc(92vh-120px)] overflow-y-auto px-6 pb-8 sm:px-10">
          <label className="mb-8 flex h-16 items-center gap-4 rounded-md border-2 border-[#999] bg-white px-5 text-[#2f3033] sm:h-24">
            <Search className="size-8 sm:size-11" />
            <span className="sr-only">{labels.searchMake}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder={labels.searchMake}
              className="min-w-0 flex-1 bg-transparent text-2xl font-semibold outline-none placeholder:text-[#a0a0a0] sm:text-5xl"
            />
          </label>

          {selectedBrand ? (
            <div className="mb-8">
              <p className="mb-3 text-xl font-bold text-[#2f3033] sm:text-3xl">{labels.selected}</p>
              <button
                type="button"
                onClick={() => onSelect("")}
                className="rounded-full border-2 border-[#d2d2d2] px-6 py-3 text-xl font-bold text-[#555] transition hover:border-[#1b8ed1] hover:text-[#1b8ed1] sm:text-3xl"
              >
                {selectedBrand} · {labels.remove}
              </button>
            </div>
          ) : null}

          <section className="mb-10">
            <h4 className="mb-5 text-2xl font-bold text-[#2f3033] sm:text-4xl">{labels.popularMakes}</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {popularBrands.map((brand) => (
                <button
                  type="button"
                  key={brand}
                  onClick={() => onSelect(brand)}
                  className="flex h-24 items-center justify-center rounded-md border-2 border-[#d2d2d2] bg-white px-3 text-center text-xl font-extrabold text-[#06233f] transition hover:border-[#1b8ed1] hover:bg-[#eef8ff] sm:h-28 sm:text-2xl"
                >
                  <span>{brand}</span>
                  <span className="ml-2 text-[#607085]">{brandCounts[brand] || 0}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-4 text-2xl font-bold text-[#2f3033] sm:text-4xl">{labels.allMakes}</h4>
            <div className="divide-y divide-[#dedede]">
              {filteredBrands.map((brand) => (
                <button
                  type="button"
                  key={brand}
                  onClick={() => onSelect(brand)}
                  className="flex w-full items-center justify-between gap-5 py-5 text-left text-2xl font-bold text-[#2f3033] transition hover:text-[#1b8ed1] sm:py-6 sm:text-4xl"
                >
                  <span>{brand}</span>
                  <span className="flex items-center gap-5 text-[#777]">
                    <span className="text-xl sm:text-3xl">{brandCounts[brand] || 0}</span>
                    <ChevronRight className="size-7 text-[#999] sm:size-10" />
                  </span>
                </button>
              ))}
              {filteredBrands.length === 0 ? (
                <p className="py-8 text-xl font-semibold text-[#777] sm:text-3xl">{labels.empty}</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const fallbackYearHistogram = [
  1, 1, 1, 1, 2, 4, 5, 3, 4, 5, 7, 3, 3, 4, 4, 5, 6, 8, 10, 11, 12, 14, 17, 20, 22, 23, 25, 28, 36, 31, 40, 48, 62, 52, 58, 70, 58, 60, 64, 86, 100
];

const fallbackLengthHistogram = [
  92, 12, 11, 13, 9, 14, 13, 10, 9, 10, 11, 48, 40, 34, 29, 27, 28, 28, 26, 28, 22, 21, 20, 18, 17, 15, 13, 10, 8, 7, 18, 10, 6, 4, 4, 2
];

const fallbackPriceHistogram = [
  32, 36, 40, 34, 30, 26, 22, 18, 16, 14, 12, 10, 9, 8, 7, 6, 10, 14, 19, 12, 9, 8, 7, 6, 5, 4, 5, 7, 9, 13, 18, 24, 30, 38, 52, 70, 88, 100, 42, 24
];

const defaultRangeHistograms: RangeHistograms = {
  year: { bars: fallbackYearHistogram, counts: fallbackYearHistogram.map(() => 0), values: [] },
  length: { bars: fallbackLengthHistogram, counts: fallbackLengthHistogram.map(() => 0), values: [] },
  price: { bars: fallbackPriceHistogram, counts: fallbackPriceHistogram.map(() => 0), values: [] }
};

function BoatCategoryDrawing({ category }: { category: string }) {
  const sail = category === "Sailing boats" || category === "Catamarans";
  const yacht = category === "Yachts";
  const rib = category === "RIBs";
  const jet = category === "Jet skis";
  const fishing = category === "Fishing boats";
  const classic = category === "Classic boats";
  const electric = category === "Electric boats";

  return (
    <svg viewBox="0 0 220 90" className="h-12 w-24 text-[#333] sm:h-16 sm:w-36" aria-hidden="true">
      {sail ? (
        <>
          <path d="M105 10v52" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M101 15 54 63h47Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
          <path d="M111 21 159 63h-48Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
          <path d="M35 66h150l-18 14H54Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
          {category === "Catamarans" ? <path d="M38 80h55M128 80h55" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /> : null}
        </>
      ) : jet ? (
        <>
          <path d="M34 62c28-21 70-25 118-12 18 5 27 12 35 25H72c-18 0-30-4-38-13Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
          <path d="M85 45c18-17 37-20 58-7" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M38 77h150" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path
            d={yacht ? "M28 60h134c19 0 31-7 41-19l-8 28c-7 10-19 15-37 15H53c-14 0-22-8-25-24Z" : "M30 60h137c15 0 26-5 35-14l-9 25c-8 9-20 13-35 13H56c-13 0-22-8-26-24Z"}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path
            d={classic ? "M68 57c17-24 58-32 101-12" : "M70 57c15-18 44-27 84-20l31 18"}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M82 67h25M123 67h25" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          {rib ? <path d="M27 63c12 17 25 23 44 22h92c21 0 35-7 45-22" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /> : null}
          {fishing ? <path d="M154 30v30M142 31h26" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /> : null}
          {electric ? <path d="m104 25-12 21h17l-11 22 28-33h-18l10-10Z" fill="currentColor" /> : null}
        </>
      )}
    </svg>
  );
}

function boatTypePickerLabels(locale: string) {
  const dictionary = {
    fr: { close: "Fermer", selectAll: "Tout sélectionner" },
    de: { close: "Schließen", selectAll: "Alle auswählen" },
    it: { close: "Chiudi", selectAll: "Seleziona tutto" },
    en: { close: "Close", selectAll: "Select all" }
  };

  return dictionary[locale as keyof typeof dictionary] ?? dictionary.fr;
}

function advancedFilterLabels(locale: string) {
  const dictionary = {
    fr: {
      close: "Fermer",
      clear: "Effacer",
      reset: "Réinitialiser",
      location: "Lieu / lac",
      people: "Nombre de personnes",
      cabins: "Nombre de cabines",
      berths: "Nombre de couchettes",
      bathrooms: "Salles de bain",
      kitchen: "Cuisine",
      exteriorColor: "Couleur extérieure",
      overnight: "Hébergement de nuit",
      yes: "Oui"
    },
    de: {
      close: "Schließen",
      clear: "Löschen",
      reset: "Zurücksetzen",
      location: "Ort / See",
      people: "Anzahl Personen",
      cabins: "Anzahl Kabinen",
      berths: "Anzahl Kojen",
      bathrooms: "Bäder",
      kitchen: "Küche",
      exteriorColor: "Außenfarbe",
      overnight: "Übernachtung",
      yes: "Ja"
    },
    it: {
      close: "Chiudi",
      clear: "Cancella",
      reset: "Reimposta",
      location: "Luogo / lago",
      people: "Numero di persone",
      cabins: "Numero cabine",
      berths: "Numero cuccette",
      bathrooms: "Bagni",
      kitchen: "Cucina",
      exteriorColor: "Colore esterno",
      overnight: "Pernottamento",
      yes: "Sì"
    },
    en: {
      close: "Close",
      clear: "Clear",
      reset: "Reset",
      location: "Location / lake",
      people: "Number of people",
      cabins: "Number of cabins",
      berths: "Number of berths",
      bathrooms: "Bathrooms",
      kitchen: "Kitchen",
      exteriorColor: "Exterior color",
      overnight: "Overnight accommodation",
      yes: "Yes"
    }
  };

  return dictionary[locale as keyof typeof dictionary] ?? dictionary.fr;
}

function lengthPickerLabels(locale: string) {
  const dictionary = {
    fr: {
      clear: "Effacer",
      close: "Fermer",
      from: "De",
      to: "À",
      boats: "bateaux",
      apply: "Appliquer"
    },
    de: {
      clear: "Löschen",
      close: "Schließen",
      from: "Von",
      to: "Bis",
      boats: "Boote",
      apply: "Anwenden"
    },
    it: {
      clear: "Cancella",
      close: "Chiudi",
      from: "Da",
      to: "A",
      boats: "barche",
      apply: "Applica"
    },
    en: {
      clear: "Clear",
      close: "Close",
      from: "From",
      to: "To",
      boats: "boats",
      apply: "Apply"
    }
  };

  return dictionary[locale as keyof typeof dictionary] ?? dictionary.fr;
}

function pricePickerLabels(locale: string) {
  const dictionary = {
    fr: {
      clear: "Effacer",
      close: "Fermer",
      from: "De",
      to: "À",
      recent: "Dernières recherches",
      until100k: "jusqu’à 100’000",
      from500k: "depuis 500’000",
      boats: "bateaux",
      apply: "Appliquer"
    },
    de: {
      clear: "Löschen",
      close: "Schließen",
      from: "Von",
      to: "Bis",
      recent: "Zuletzt gesucht",
      until100k: "bis 100’000",
      from500k: "ab 500’000",
      boats: "Boote",
      apply: "Anwenden"
    },
    it: {
      clear: "Cancella",
      close: "Chiudi",
      from: "Da",
      to: "A",
      recent: "Ultime ricerche",
      until100k: "fino a 100’000",
      from500k: "da 500’000",
      boats: "barche",
      apply: "Applica"
    },
    en: {
      clear: "Clear",
      close: "Close",
      from: "From",
      to: "To",
      recent: "Last searched by you",
      until100k: "up to 100,000",
      from500k: "from 500,000",
      boats: "boats",
      apply: "Apply"
    }
  };

  return dictionary[locale as keyof typeof dictionary] ?? dictionary.fr;
}

function yearPickerLabels(locale: string) {
  const dictionary = {
    fr: {
      clear: "Effacer",
      close: "Fermer",
      from: "De",
      to: "À",
      recent: "Dernières recherches",
      from1980: "depuis 1980",
      until2026: "jusqu’à 2026",
      boats: "bateaux",
      apply: "Appliquer"
    },
    de: {
      clear: "Löschen",
      close: "Schließen",
      from: "Von",
      to: "Bis",
      recent: "Zuletzt gesucht",
      from1980: "ab 1980",
      until2026: "bis 2026",
      boats: "Boote",
      apply: "Anwenden"
    },
    it: {
      clear: "Cancella",
      close: "Chiudi",
      from: "Da",
      to: "A",
      recent: "Ultime ricerche",
      from1980: "dal 1980",
      until2026: "fino al 2026",
      boats: "barche",
      apply: "Applica"
    },
    en: {
      clear: "Clear",
      close: "Close",
      from: "From",
      to: "To",
      recent: "Last searched by you",
      from1980: "from 1980",
      until2026: "up to 2026",
      boats: "boats",
      apply: "Apply"
    }
  };

  return dictionary[locale as keyof typeof dictionary] ?? dictionary.fr;
}

function brandPickerLabels(locale: string) {
  const dictionary = {
    fr: {
      addMake: "Ajouter une marque",
      searchMake: "Rechercher une marque",
      popularMakes: "Marques populaires",
      allMakes: "Toutes les marques",
      selected: "Sélectionnée",
      remove: "retirer",
      close: "Fermer",
      empty: "Aucune marque ne correspond à cette recherche."
    },
    de: {
      addMake: "Marke hinzufügen",
      searchMake: "Marke suchen",
      popularMakes: "Beliebte Marken",
      allMakes: "Alle Marken",
      selected: "Ausgewählt",
      remove: "entfernen",
      close: "Schließen",
      empty: "Keine Marke passt zu dieser Suche."
    },
    it: {
      addMake: "Aggiungi marca",
      searchMake: "Cerca marca",
      popularMakes: "Marche popolari",
      allMakes: "Tutte le marche",
      selected: "Selezionata",
      remove: "rimuovi",
      close: "Chiudi",
      empty: "Nessuna marca corrisponde a questa ricerca."
    },
    en: {
      addMake: "Add make",
      searchMake: "Search make",
      popularMakes: "Popular makes",
      allMakes: "All makes",
      selected: "Selected",
      remove: "remove",
      close: "Close",
      empty: "No makes match that search."
    }
  };

  return dictionary[locale as keyof typeof dictionary] ?? dictionary.fr;
}
