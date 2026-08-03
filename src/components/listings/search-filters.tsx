import { SlidersHorizontal } from "lucide-react";
import { brands, cantons, categories, conditions, engineTypes, fuelTypes, hullMaterials, jetSkiEngineTypes, lakes, listingKinds } from "@/lib/data/reference";
import type { ListingFilters } from "@/types/domain";
import { refLabel, ui } from "@/i18n/ui";

export function SearchFilters({ filters, locale, availableBrands = brands }: { filters: ListingFilters; locale: string; availableBrands?: readonly string[] }) {
  const text = ui(locale);
  const extra = extraFilterLabels(locale);
  const select = (name: string, label: string, values: readonly string[]) => (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <select name={name} defaultValue={(filters as Record<string, unknown>)[name] as string | undefined} className="h-10 rounded-md border border-[#cbd7e4] bg-white px-3">
        <option value="">{text.common.all}</option>
        {values.map((value) => <option key={value} value={value}>{refLabel(locale, value)}</option>)}
      </select>
    </label>
  );

  return (
    <aside className="rounded-md border border-[#d9e2ec] bg-white p-4">
      <div className="mb-4 flex items-center gap-2 font-bold text-navy">
        <SlidersHorizontal size={18} />
        {text.search.filters}
      </div>
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm font-medium">
          {text.search.text}
          <input name="q" defaultValue={filters.q} className="h-10 rounded-md border border-[#cbd7e4] px-3" placeholder={text.search.textPlaceholder} />
        </label>
        {select("listingKind", extra.listingKind, listingKinds)}
        {select("category", text.search.category, categories)}
        {select("brand", text.common.brand, availableBrands)}
        <label className="grid gap-1 text-sm font-medium">
          {text.common.model}
          <input name="model" defaultValue={filters.model} className="h-10 rounded-md border border-[#cbd7e4] px-3" placeholder={text.common.model} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input name="priceMin" defaultValue={filters.priceMin} type="number" placeholder={text.search.priceMin} className="h-10 rounded-md border border-[#cbd7e4] px-3" />
          <input name="priceMax" defaultValue={filters.priceMax} type="number" placeholder={text.search.priceMax} className="h-10 rounded-md border border-[#cbd7e4] px-3" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input name="yearMin" defaultValue={filters.yearMin} type="number" placeholder={text.search.yearMin} className="h-10 rounded-md border border-[#cbd7e4] px-3" />
          <input name="yearMax" defaultValue={filters.yearMax} type="number" placeholder={text.search.yearMax} className="h-10 rounded-md border border-[#cbd7e4] px-3" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input name="lengthMin" defaultValue={filters.lengthMin} type="number" placeholder={text.search.lengthMin} className="h-10 rounded-md border border-[#cbd7e4] px-3" />
          <input name="lengthMax" defaultValue={filters.lengthMax} type="number" placeholder={text.search.lengthMax} className="h-10 rounded-md border border-[#cbd7e4] px-3" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input name="maxEngineHours" defaultValue={filters.maxEngineHours} type="number" placeholder={extra.hoursMax} className="h-10 rounded-md border border-[#cbd7e4] px-3" />
          <input name="powerMin" defaultValue={filters.powerMin} type="number" placeholder={extra.powerMin} className="h-10 rounded-md border border-[#cbd7e4] px-3" />
        </div>
        <input name="seatsMin" defaultValue={filters.seatsMin} type="number" placeholder={extra.seatsMin} className="h-10 rounded-md border border-[#cbd7e4] px-3" />
        {select("fuelType", text.search.fuel, fuelTypes)}
        {select("engineType", text.search.engine, [...engineTypes, ...jetSkiEngineTypes])}
        {select("condition", text.search.condition, conditions)}
        {select("hullMaterial", text.search.material, hullMaterials)}
        {select("canton", text.common.canton, cantons)}
        {select("lake", text.common.lake, lakes)}
        <input name="city" defaultValue={filters.city} placeholder={text.common.city} className="h-10 rounded-md border border-[#cbd7e4] px-3" />
        <label className="flex items-center gap-2 text-sm"><input name="withPhotos" type="checkbox" defaultChecked={filters.withPhotos} value="true" /> {text.search.withPhotos}</label>
        <label className="flex items-center gap-2 text-sm"><input name="electric" type="checkbox" defaultChecked={filters.electric} value="true" /> {text.search.electric}</label>
        <label className="flex items-center gap-2 text-sm"><input name="financingAvailable" type="checkbox" defaultChecked={filters.financingAvailable} value="true" /> {text.search.financing}</label>
        <button className="mt-2 h-11 rounded-md bg-navy font-bold text-white">{text.search.apply}</button>
      </div>
    </aside>
  );
}

function extraFilterLabels(locale: string) {
  if (locale === "de") return { listingKind: "Fahrzeugtyp", hoursMax: "Stunden max.", powerMin: "Leistung min.", seatsMin: "Sitzplätze min." };
  if (locale === "it") return { listingKind: "Tipo di annuncio", hoursMax: "Ore max.", powerMin: "Potenza min.", seatsMin: "Posti min." };
  if (locale === "en") return { listingKind: "Listing type", hoursMax: "Max hours", powerMin: "Min power", seatsMin: "Min seats" };
  return { listingKind: "Type d'annonce", hoursMax: "Heures max.", powerMin: "Puissance min.", seatsMin: "Places min." };
}
