import { submitListingAction } from "@/lib/actions/listings";
import { brands, cantons, categories, conditions, engineTypes, fuelTypes, hullMaterials, lakes } from "@/lib/data/reference";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { refLabel, ui } from "@/i18n/ui";

export function ListingForm({ locale }: { locale: string }) {
  const text = ui(locale);
  return (
    <form action={submitListingAction} className="grid gap-6">
      <section className="rounded-md border border-[#d9e2ec] bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-navy">{text.sell.step1}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={text.sell.type}><Input name="boatType" placeholder="Day cruiser" required /></Field>
          <Field label={text.search.category}><Select name="category" required>{categories.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
          <Field label={text.common.brand}><Select name="brand" required>{brands.map((item) => <option key={item}>{item}</option>)}</Select></Field>
          <Field label={text.common.model}><Input name="model" required /></Field>
          <Field label={text.common.year}><Input name="year" type="number" required min="1900" max="2027" /></Field>
          <Field label={text.search.condition}><Select name="condition" required>{conditions.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
        </div>
      </section>
      <section className="rounded-md border border-[#d9e2ec] bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-navy">{text.sell.step2}</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="CHF"><Input name="priceChf" type="number" required min="1" /></Field>
          <label className="flex items-center gap-2 pt-8 text-sm"><input type="checkbox" name="vatIncluded" value="true" /> {text.sell.vat}</label>
          <label className="flex items-center gap-2 pt-8 text-sm"><input type="checkbox" name="negotiable" value="true" /> {text.sell.negotiable}</label>
          <label className="flex items-center gap-2 pt-8 text-sm"><input type="checkbox" name="financingAvailable" value="true" /> {text.sell.financing}</label>
        </div>
      </section>
      <section className="rounded-md border border-[#d9e2ec] bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-navy">{text.sell.step3}</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label={text.sell.fuel}><Select name="fuelType" required>{fuelTypes.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
          <Field label={text.sell.engineType}><Select name="engineType" required>{engineTypes.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
          <Field label={text.sell.powerHp}><Input name="powerHp" type="number" min="0" required /></Field>
          <Field label={text.sell.engineCount}><Input name="engineCount" type="number" min="0" max="8" required /></Field>
          <Field label={text.sell.engineHours}><Input name="engineHours" type="number" min="0" required /></Field>
          <Field label={`${text.common.length} m`}><Input name="lengthM" type="number" step="0.01" required /></Field>
          <Field label={text.sell.beam}><Input name="beamM" type="number" step="0.01" required /></Field>
          <Field label={text.sell.weight}><Input name="weightKg" type="number" required /></Field>
          <Field label={text.sell.material}><Select name="hullMaterial" required>{hullMaterials.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
        </div>
      </section>
      <section className="rounded-md border border-[#d9e2ec] bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-navy">{text.sell.step4}</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label={text.common.canton}><Select name="canton" required>{cantons.map((item) => <option key={item}>{item}</option>)}</Select></Field>
          <Field label={text.common.lake}><Select name="lake" required>{lakes.map((item) => <option key={item} value={item}>{refLabel(locale, item)}</option>)}</Select></Field>
          <Field label={text.common.city}><Input name="city" required /></Field>
          <Field label={text.common.marina}><Input name="marina" /></Field>
        </div>
      </section>
      <section className="rounded-md border border-[#d9e2ec] bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-navy">{text.sell.step5}</h2>
        <div className="grid gap-4">
          <Field label={text.common.description}><Textarea name="description" required placeholder={text.sell.minDescription} /></Field>
          <Field label={text.common.equipment}><Textarea name="equipment" placeholder={text.sell.equipmentPlaceholder} /></Field>
        </div>
      </section>
      <section className="rounded-md border border-[#d9e2ec] bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-navy">{text.sell.step6}</h2>
        <div className="rounded-md border border-dashed border-[#b8c7d8] p-6 text-sm text-[#607085]">
          {text.sell.photoPlaceholder}
        </div>
      </section>
      <section className="rounded-md border border-[#d9e2ec] bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-navy">{text.sell.step7}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={text.sell.contactName}><Input name="contactName" required /></Field>
          <Field label={text.sell.contactEmail}><Input name="contactEmail" type="email" required /></Field>
          <Field label={text.common.phone}><Input name="contactPhone" /></Field>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button name="saveAsDraft" value="true" variant="secondary">{text.sell.saveDraft}</Button>
          <Button name="saveAsDraft" value="false">{text.sell.sendModeration}</Button>
        </div>
      </section>
    </form>
  );
}
