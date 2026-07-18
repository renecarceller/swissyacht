"use client";

import { useMemo, useState } from "react";
import { Bath, BedDouble, CookingPot, Moon, Palette, Users } from "lucide-react";
import { submitListingAction } from "@/lib/actions/listings";
import { brands, cantons, categories, conditions, engineTypes, exteriorColors, fuelTypes, hullMaterials, lakes } from "@/lib/data/reference";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { refLabel, ui } from "@/i18n/ui";

type ListingDraft = {
  boatType: string;
  category: string;
  brand: string;
  model: string;
  year: string;
  condition: string;
  priceChf: string;
  vatIncluded: boolean;
  negotiable: boolean;
  financingAvailable: boolean;
  fuelType: string;
  engineType: string;
  powerHp: string;
  engineCount: string;
  engineHours: string;
  lengthM: string;
  beamM: string;
  weightKg: string;
  hullMaterial: string;
  canton: string;
  lake: string;
  city: string;
  marina: string;
  peopleCapacity: string;
  cabins: string;
  berths: string;
  bathrooms: string;
  kitchen: boolean;
  color: string;
  overnightAccommodation: boolean;
  description: string;
  equipment: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

const initialDraft: ListingDraft = {
  boatType: "",
  category: categories[0],
  brand: brands[0],
  model: "",
  year: "",
  condition: conditions[0],
  priceChf: "",
  vatIncluded: false,
  negotiable: false,
  financingAvailable: false,
  fuelType: fuelTypes[0],
  engineType: engineTypes[0],
  powerHp: "",
  engineCount: "",
  engineHours: "",
  lengthM: "",
  beamM: "",
  weightKg: "",
  hullMaterial: hullMaterials[0],
  canton: cantons[0],
  lake: lakes[0],
  city: "",
  marina: "",
  peopleCapacity: "",
  cabins: "",
  berths: "",
  bathrooms: "",
  kitchen: false,
  color: exteriorColors[0],
  overnightAccommodation: false,
  description: "",
  equipment: "",
  contactName: "",
  contactEmail: "",
  contactPhone: ""
};

export function ListingForm({ locale, availableBrands = [...brands] }: { locale: string; availableBrands?: string[] }) {
  const text = ui(locale);
  const labels = stepFormLabels(locale);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>(initialDraft);
  const totalSteps = 8;
  const progress = useMemo(() => Math.round(((step + 1) / totalSteps) * 100), [step]);

  const update = (key: keyof ListingDraft, value: string | boolean) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <form action={submitListingAction} className="grid gap-5">
      <HiddenDraftInputs draft={draft} />
      <input type="hidden" name="locale" value={locale} />
      <div className="rounded-md border border-[#d9e2ec] bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold text-[#607085]">
          <span>{labels.step} {step + 1} / {totalSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#e8f3fb]">
          <div className="h-full rounded-full bg-[#8bd3ff] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 ? (
        <StepCard title={text.sell.step1}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={text.sell.type}><Input value={draft.boatType} onChange={(event) => update("boatType", event.target.value)} placeholder="Day cruiser" /></Field>
            <Field label={text.search.category}><Select value={draft.category} onChange={(event) => update("category", event.target.value)}>{categories.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
            <Field label={text.common.brand}>
              <Input value={draft.brand} onChange={(event) => update("brand", event.target.value)} list="listing-brand-options" />
              <datalist id="listing-brand-options">
                {availableBrands.map((item) => <option key={item} value={item} />)}
              </datalist>
            </Field>
            <Field label={text.common.model}><Input value={draft.model} onChange={(event) => update("model", event.target.value)} /></Field>
            <Field label={text.common.year}><Input value={draft.year} onChange={(event) => update("year", event.target.value)} type="number" min="1900" max="2027" /></Field>
            <Field label={text.search.condition}><Select value={draft.condition} onChange={(event) => update("condition", event.target.value)}>{conditions.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
          </div>
        </StepCard>
      ) : null}

      {step === 1 ? (
        <StepCard title={text.sell.step2}>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="CHF"><Input value={draft.priceChf} onChange={(event) => update("priceChf", event.target.value)} type="number" min="1" /></Field>
            <CheckField checked={draft.vatIncluded} onChange={(value) => update("vatIncluded", value)} label={text.sell.vat} />
            <CheckField checked={draft.negotiable} onChange={(value) => update("negotiable", value)} label={text.sell.negotiable} />
            <CheckField checked={draft.financingAvailable} onChange={(value) => update("financingAvailable", value)} label={text.sell.financing} />
          </div>
        </StepCard>
      ) : null}

      {step === 2 ? (
        <StepCard title={text.sell.step3}>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label={text.sell.fuel}><Select value={draft.fuelType} onChange={(event) => update("fuelType", event.target.value)}>{fuelTypes.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
            <Field label={text.sell.engineType}><Select value={draft.engineType} onChange={(event) => update("engineType", event.target.value)}>{engineTypes.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
            <Field label={text.sell.powerHp}><Input value={draft.powerHp} onChange={(event) => update("powerHp", event.target.value)} type="number" min="0" /></Field>
            <Field label={text.sell.engineCount}><Input value={draft.engineCount} onChange={(event) => update("engineCount", event.target.value)} type="number" min="0" max="8" /></Field>
            <Field label={text.sell.engineHours}><Input value={draft.engineHours} onChange={(event) => update("engineHours", event.target.value)} type="number" min="0" /></Field>
            <Field label={`${text.common.length} m`}><Input value={draft.lengthM} onChange={(event) => update("lengthM", event.target.value)} type="number" step="0.01" /></Field>
            <Field label={text.sell.beam}><Input value={draft.beamM} onChange={(event) => update("beamM", event.target.value)} type="number" step="0.01" /></Field>
            <Field label={text.sell.weight}><Input value={draft.weightKg} onChange={(event) => update("weightKg", event.target.value)} type="number" /></Field>
            <Field label={text.sell.material}><Select value={draft.hullMaterial} onChange={(event) => update("hullMaterial", event.target.value)}>{hullMaterials.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
          </div>
        </StepCard>
      ) : null}

      {step === 3 ? (
        <StepCard title={text.sell.step4}>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label={text.common.canton}><Select value={draft.canton} onChange={(event) => update("canton", event.target.value)}>{cantons.map((item) => <option key={item}>{item}</option>)}</Select></Field>
            <Field label={text.common.lake}><Select value={draft.lake} onChange={(event) => update("lake", event.target.value)}>{lakes.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
            <Field label={text.common.city}><Input value={draft.city} onChange={(event) => update("city", event.target.value)} /></Field>
            <Field label={text.common.marina}><Input value={draft.marina} onChange={(event) => update("marina", event.target.value)} /></Field>
          </div>
        </StepCard>
      ) : null}

      {step === 4 ? (
        <StepCard title={labels.habitabilityTitle}>
          <div className="divide-y divide-[#e1e1e1]">
            <CompactNumberField icon={<Users />} label={labels.people} value={draft.peopleCapacity} onChange={(value) => update("peopleCapacity", value)} max={20} />
            <CompactNumberField icon={<BedDouble />} label={labels.cabins} value={draft.cabins} onChange={(value) => update("cabins", value)} max={10} />
            <CompactNumberField icon={<Moon />} label={labels.berths} value={draft.berths} onChange={(value) => update("berths", value)} max={20} />
            <CompactNumberField icon={<Bath />} label={labels.bathrooms} value={draft.bathrooms} onChange={(value) => update("bathrooms", value)} max={8} />
            <CompactBooleanField icon={<CookingPot />} label={labels.kitchen} checked={draft.kitchen} onChange={(value) => update("kitchen", value)} yes={labels.yes} no={labels.no} />
            <CompactSelectField icon={<Palette />} label={labels.exteriorColor} value={draft.color} onChange={(value) => update("color", value)} options={exteriorColors.map((color) => ({ value: color, label: refLabel(locale, color) }))} />
            <CompactBooleanField icon={<Moon />} label={labels.overnight} checked={draft.overnightAccommodation} onChange={(value) => update("overnightAccommodation", value)} yes={labels.yes} no={labels.no} />
          </div>
        </StepCard>
      ) : null}

      {step === 5 ? (
        <StepCard title={labels.descriptionTitle}>
          <div className="grid gap-4">
            <Field label={text.common.description}><Textarea value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder={text.sell.minDescription} /></Field>
            <Field label={text.common.equipment}><Textarea value={draft.equipment} onChange={(event) => update("equipment", event.target.value)} placeholder={text.sell.equipmentPlaceholder} /></Field>
          </div>
        </StepCard>
      ) : null}

      {step === 6 ? (
        <StepCard title={labels.photosTitle}>
          <div className="rounded-md border border-dashed border-[#b8c7d8] p-6 text-sm text-[#607085]">
            {text.sell.photoPlaceholder}
          </div>
        </StepCard>
      ) : null}

      {step === 7 ? (
        <StepCard title={labels.contactTitle}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={text.sell.contactName}><Input value={draft.contactName} onChange={(event) => update("contactName", event.target.value)} /></Field>
            <Field label={text.sell.contactEmail}><Input value={draft.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} type="email" /></Field>
            <Field label={text.common.phone}><Input value={draft.contactPhone} onChange={(event) => update("contactPhone", event.target.value)} /></Field>
          </div>
        </StepCard>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#d9e2ec] bg-white p-4">
        <Button type="button" variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
          {labels.back}
        </Button>
        {step < totalSteps - 1 ? (
          <Button type="button" className="bg-[#8bd3ff] text-[#06233f] shadow-[0_4px_0_#58b9e8] hover:bg-[#aee2ff]" onClick={() => setStep((current) => Math.min(totalSteps - 1, current + 1))}>
            {labels.continue}
          </Button>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button name="saveAsDraft" value="true" variant="secondary">{text.sell.saveDraft}</Button>
            <Button name="saveAsDraft" value="false" className="bg-[#8bd3ff] text-[#06233f] shadow-[0_4px_0_#58b9e8] hover:bg-[#aee2ff]">{text.sell.sendModeration}</Button>
          </div>
        )}
      </div>
    </form>
  );
}

function HiddenDraftInputs({ draft }: { draft: ListingDraft }) {
  return (
    <>
      {Object.entries(draft).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={typeof value === "boolean" ? String(value) : value} />
      ))}
    </>
  );
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-[#d9e2ec] bg-white p-5">
      <h2 className="mb-4 text-lg font-bold text-navy">{title}</h2>
      {children}
    </section>
  );
}

function CheckField({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 pt-8 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function CompactNumberField({
  icon,
  label,
  value,
  max,
  onChange
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[44px_1fr_180px] sm:items-center">
      <span className="hidden text-[#2f3033] sm:block [&>svg]:size-8">{icon}</span>
      <label className="text-lg font-semibold text-[#2f3033]">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring h-11 rounded-md border border-[#cbd7e4] bg-white px-3 text-sm">
        <option value="">-</option>
        {Array.from({ length: max }, (_, index) => String(index + 1)).map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function CompactBooleanField({
  icon,
  label,
  checked,
  yes,
  no,
  onChange
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  yes: string;
  no: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[44px_1fr_180px] sm:items-center">
      <span className="hidden text-[#2f3033] sm:block [&>svg]:size-8">{icon}</span>
      <label className="text-lg font-semibold text-[#2f3033]">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-11 rounded-md border px-3 text-sm font-semibold transition ${checked ? "border-[#58b9e8] bg-[#8bd3ff] text-[#06233f]" : "border-[#cbd7e4] bg-white text-[#21354b]"}`}
      >
        {checked ? yes : no}
      </button>
    </div>
  );
}

function CompactSelectField({
  icon,
  label,
  value,
  options,
  onChange
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[44px_1fr_180px] sm:items-center">
      <span className="hidden text-[#2f3033] sm:block [&>svg]:size-8">{icon}</span>
      <label className="text-lg font-semibold text-[#2f3033]">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring h-11 rounded-md border border-[#cbd7e4] bg-white px-3 text-sm">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

function stepFormLabels(locale: string) {
  const dictionary = {
    fr: { back: "Retour", continue: "Continuer", step: "Etape", habitabilityTitle: "Etape 5 · Capacite et habitabilite", descriptionTitle: "Etape 6 · Description et equipement", photosTitle: "Etape 7 · Photos", contactTitle: "Etape 8 · Contact et publication", people: "Nombre de personnes", cabins: "Nombre de cabines", berths: "Nombre de couchettes", bathrooms: "Salles de bain", kitchen: "Cuisine", exteriorColor: "Couleur exterieure", overnight: "Hebergement de nuit", yes: "Oui", no: "Non" },
    de: { back: "Zurueck", continue: "Weiter", step: "Schritt", habitabilityTitle: "Schritt 5 · Kapazitaet und Wohnen", descriptionTitle: "Schritt 6 · Beschreibung und Ausstattung", photosTitle: "Schritt 7 · Fotos", contactTitle: "Schritt 8 · Kontakt und Veroeffentlichung", people: "Anzahl Personen", cabins: "Anzahl Kabinen", berths: "Anzahl Kojen", bathrooms: "Baeder", kitchen: "Kueche", exteriorColor: "Aussenfarbe", overnight: "Uebernachtung", yes: "Ja", no: "Nein" },
    it: { back: "Indietro", continue: "Continua", step: "Passo", habitabilityTitle: "Passo 5 · Capacita e abitabilita", descriptionTitle: "Passo 6 · Descrizione e dotazioni", photosTitle: "Passo 7 · Foto", contactTitle: "Passo 8 · Contatto e pubblicazione", people: "Numero di persone", cabins: "Numero cabine", berths: "Numero cuccette", bathrooms: "Bagni", kitchen: "Cucina", exteriorColor: "Colore esterno", overnight: "Pernottamento", yes: "Si", no: "No" },
    en: { back: "Back", continue: "Continue", step: "Step", habitabilityTitle: "Step 5 · Capacity and accommodation", descriptionTitle: "Step 6 · Description and equipment", photosTitle: "Step 7 · Photos", contactTitle: "Step 8 · Contact and publishing", people: "Number of people", cabins: "Number of cabins", berths: "Number of berths", bathrooms: "Bathrooms", kitchen: "Kitchen", exteriorColor: "Exterior color", overnight: "Overnight accommodation", yes: "Yes", no: "No" }
  };

  return dictionary[locale as keyof typeof dictionary] ?? dictionary.fr;
}
