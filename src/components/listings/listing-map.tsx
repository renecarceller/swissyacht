"use client";

/* eslint-disable @next/next/no-img-element */
import type { ChangeEvent, PointerEvent, ReactNode, WheelEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Grid2X2, List, MapPin, Minus, Plus, ShipWheel, SlidersHorizontal } from "lucide-react";
import type { Listing, ListingFilters } from "@/types/domain";
import { Link } from "@/i18n/routing";
import { getListingCoordinate } from "@/lib/data/location-coordinates";
import { categories, fuelTypes } from "@/lib/data/reference";
import { formatChf } from "@/lib/utils";
import { refLabel, ui } from "@/i18n/ui";

type MapMarker = {
  key: string;
  label: string;
  lat: number;
  lng: number;
  listings: Listing[];
};

const TILE_SIZE = 256;
const MIN_ZOOM = 7;
const MAX_ZOOM = 11;
const SWITZERLAND_CENTER = { lat: 46.8182, lng: 8.2275 };

const MAIN_CITIES = [
  { name: "Genève", lat: 46.2044, lng: 6.1432 },
  { name: "Lausanne", lat: 46.5197, lng: 6.6323 },
  { name: "Bern", lat: 46.948, lng: 7.4474 },
  { name: "Basel", lat: 47.5596, lng: 7.5886 },
  { name: "Zürich", lat: 47.3769, lng: 8.5417 },
  { name: "Luzern", lat: 47.0502, lng: 8.3093 },
  { name: "Lugano", lat: 46.0037, lng: 8.9511 },
  { name: "St. Gallen", lat: 47.4245, lng: 9.3767 },
  { name: "Neuchâtel", lat: 46.9918, lng: 6.931 },
  { name: "Thun", lat: 46.757, lng: 7.628 }
];

const LAKES = [
  { name: "Lac Léman", lat: 46.41, lng: 6.52, width: 188, height: 42, rotate: -17 },
  { name: "Lac de Neuchâtel", lat: 46.93, lng: 6.82, width: 92, height: 22, rotate: -21 },
  { name: "Lac de Bienne", lat: 47.09, lng: 7.18, width: 46, height: 15, rotate: -20 },
  { name: "Lac de Zurich", lat: 47.27, lng: 8.66, width: 90, height: 18, rotate: 17 },
  { name: "Lac des Quatre-Cantons", lat: 47.01, lng: 8.4, width: 78, height: 25, rotate: -20 },
  { name: "Lac de Constance", lat: 47.61, lng: 9.36, width: 142, height: 34, rotate: 12 },
  { name: "Lac de Lugano", lat: 46.0, lng: 8.97, width: 74, height: 18, rotate: -34 },
  { name: "Lac Majeur", lat: 46.15, lng: 8.74, width: 112, height: 22, rotate: -35 },
  { name: "Lac de Thun", lat: 46.69, lng: 7.72, width: 76, height: 16, rotate: -7 },
  { name: "Lac de Brienz", lat: 46.73, lng: 8.03, width: 62, height: 14, rotate: -11 },
  { name: "Lac de Zoug", lat: 47.13, lng: 8.49, width: 44, height: 13, rotate: 6 }
];

const SWISS_OUTLINE = [
  { lat: 47.8, lng: 6.05 },
  { lat: 47.73, lng: 7.6 },
  { lat: 47.83, lng: 8.55 },
  { lat: 47.7, lng: 9.55 },
  { lat: 47.3, lng: 10.45 },
  { lat: 46.78, lng: 10.35 },
  { lat: 46.33, lng: 9.35 },
  { lat: 45.83, lng: 8.95 },
  { lat: 45.82, lng: 8.45 },
  { lat: 46.14, lng: 7.55 },
  { lat: 46.0, lng: 6.75 },
  { lat: 46.25, lng: 5.95 },
  { lat: 46.95, lng: 5.95 },
  { lat: 47.8, lng: 6.05 }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lngToX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * TILE_SIZE * 2 ** zoom;
}

function latToY(lat: number, zoom: number) {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * TILE_SIZE * 2 ** zoom;
}

function locationLabel(listing: Listing) {
  return listing.marina || listing.city || listing.lake || listing.canton;
}

function formatMarkerCount(count: number) {
  if (count >= 1000) return `${Math.round(count / 100) / 10}K`;
  return String(count);
}

function countActiveFilters(filters: ListingFilters) {
  return [
    filters.q,
    filters.category,
    filters.brand,
    filters.model,
    filters.priceMin,
    filters.priceMax,
    filters.yearMin,
    filters.yearMax,
    filters.lengthMin,
    filters.lengthMax,
    filters.fuelType,
    filters.engineType,
    filters.condition,
    filters.hullMaterial,
    filters.withPhotos,
    filters.electric,
    filters.financingAvailable
  ].filter(Boolean).length;
}

function filterValue(value: unknown) {
  if (value === undefined || value === null || value === false || value === "") return "";
  return String(value);
}

function filterLabel(locale: string, fallback: string, value?: string) {
  return value ? refLabel(locale, value) : fallback;
}

function rangeLabel(fallback: string, min?: number, max?: number, suffix = "") {
  if (min && max) return `${min}${suffix} - ${max}${suffix}`;
  if (min) return `${fallback} +${min}${suffix}`;
  if (max) return `${fallback} ≤ ${max}${suffix}`;
  return fallback;
}

function submitOnSelectChange(event: ChangeEvent<HTMLSelectElement>) {
  event.currentTarget.form?.requestSubmit();
}

function HiddenPreservedFilters({ filters }: { filters: ListingFilters }) {
  const preservedNames: (keyof ListingFilters)[] = [
    "q",
    "boatType",
    "brand",
    "model",
    "beamMin",
    "beamMax",
    "engines",
    "powerMin",
    "engineType",
    "maxEngineHours",
    "condition",
    "color",
    "peopleCapacityMin",
    "cabinsMin",
    "berthsMin",
    "bathroomsMin",
    "kitchen",
    "overnightAccommodation",
    "hullMaterial",
    "canton",
    "lake",
    "city",
    "marina",
    "sellerType",
    "newOrUsed",
    "trailerIncluded",
    "berthIncluded",
    "licenseRequired",
    "financingAvailable",
    "electric",
    "vatIncluded",
    "withPhotos",
    "sort"
  ];

  return (
    <>
      <input type="hidden" name="view" value="map" />
      {preservedNames.map((name) => {
        const value = filterValue(filters[name]);
        if (!value) return null;
        return <input key={name} type="hidden" name={name} value={value} />;
      })}
    </>
  );
}

function MapFilterShell({
  label,
  active,
  children
}: {
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group relative shrink-0">
      <summary
        className={`flex cursor-pointer list-none items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden ${
          active ? "border-black bg-black text-white" : "border-[#d9e2ec] bg-white text-[#2d3137]"
        }`}
      >
        {label}
        <ChevronDown size={15} className="transition group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 top-[calc(100%+0.5rem)] z-40 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-[#d9e2ec] bg-white p-4 shadow-2xl">
        {children}
      </div>
    </details>
  );
}

function projectPoint(lat: number, lng: number, zoom: number, viewport: { left: number; top: number }) {
  return {
    x: lngToX(lng, zoom) - viewport.left,
    y: latToY(lat, zoom) - viewport.top
  };
}

function CleanSwissMapLayer({
  zoom,
  viewport
}: {
  zoom: number;
  viewport: { left: number; top: number };
}) {
  const lakeScale = clamp(2 ** (zoom - 8), 0.8, 4.2);
  const outlinePoints = SWISS_OUTLINE.map((point) => {
    const projected = projectPoint(point.lat, point.lng, zoom, viewport);
    return `${projected.x},${projected.y}`;
  }).join(" ");

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(135,206,235,0.10),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f9fcff_100%)]" />
      <svg className="absolute inset-0 size-full" aria-hidden="true">
        <polyline points={outlinePoints} fill="rgba(255,255,255,0.82)" stroke="#d8e2ec" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>

      {LAKES.map((lake) => {
        const point = projectPoint(lake.lat, lake.lng, zoom, viewport);

        return (
          <span
            key={lake.name}
            className="pointer-events-none absolute rounded-[999px] bg-[#8fd8ff]/80 shadow-[0_0_0_1px_rgba(71,169,224,0.20),inset_0_1px_8px_rgba(255,255,255,0.75)]"
            style={{
              left: point.x,
              top: point.y,
              width: lake.width * lakeScale,
              height: lake.height * lakeScale,
              transform: `translate(-50%, -50%) rotate(${lake.rotate}deg)`
            }}
          />
        );
      })}

      {MAIN_CITIES.map((city) => {
        const point = projectPoint(city.lat, city.lng, zoom, viewport);

        return (
          <span
            key={city.name}
            className="pointer-events-none absolute z-[1] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-[#586474] shadow-sm md:text-xs"
            style={{ left: point.x, top: point.y }}
          >
            {city.name}
          </span>
        );
      })}
    </div>
  );
}

export function ListingMap({
  listings,
  locale,
  filters
}: {
  listings: Listing[];
  locale: string;
  filters: ListingFilters;
}) {
  const text = ui(locale);
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const animationRef = useRef<number | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [zoom, setZoom] = useState(8);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 1100, height: 680 });

  useEffect(() => {
    if (!mapRef.current) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    resizeObserver.observe(mapRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const markers = useMemo(() => {
    const grouped = new Map<string, MapMarker>();

    listings.forEach((listing) => {
      const coordinate = getListingCoordinate(listing);
      if (!coordinate) return;
      const label = locationLabel(listing);
      const key = label || `${coordinate.lat}-${coordinate.lng}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.listings.push(listing);
        return;
      }

      grouped.set(key, {
        key,
        label,
        lat: coordinate.lat,
        lng: coordinate.lng,
        listings: [listing]
      });
    });

    return Array.from(grouped.values());
  }, [listings]);

  const activeMarker = markers.find((marker) => marker.key === activeKey) || markers[0];
  const activeFilterCount = countActiveFilters(filters);

  const viewport = useMemo(() => {
    const centerX = lngToX(SWITZERLAND_CENTER.lng, zoom);
    const centerY = latToY(SWITZERLAND_CENTER.lat, zoom);

    return {
      left: centerX - size.width / 2 - offset.x,
      top: centerY - size.height / 2 - offset.y
    };
  }, [offset.x, offset.y, size.height, size.width, zoom]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  function zoomBy(delta: number) {
    setZoom((value) => clamp(value + delta, MIN_ZOOM, MAX_ZOOM));
  }

  function setOffsetFluid(nextOffset: { x: number; y: number }) {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(() => setOffset(nextOffset));
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    zoomBy(event.deltaY < 0 ? 1 : -1);
  }

  function distanceBetweenPointers() {
    const pointers = Array.from(pointersRef.current.values());
    if (pointers.length < 2) return 0;
    return Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 1) {
      dragRef.current = { x: event.clientX, y: event.clientY, originX: offset.x, originY: offset.y };
    }
    if (pointersRef.current.size === 2) {
      dragRef.current = null;
      pinchRef.current = { distance: distanceBetweenPointers(), zoom };
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (pointersRef.current.has(event.pointerId)) {
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const distance = distanceBetweenPointers();
      if (distance > 0 && pinchRef.current.distance > 0) {
        const scale = distance / pinchRef.current.distance;
        setZoom(clamp(Math.round(pinchRef.current.zoom + Math.log2(scale) * 2), MIN_ZOOM, MAX_ZOOM));
      }
      return;
    }

    if (!dragRef.current) return;
    setOffsetFluid({
      x: dragRef.current.originX + event.clientX - dragRef.current.x,
      y: dragRef.current.originY + event.clientY - dragRef.current.y
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    dragRef.current = null;
    const remainingPointer = Array.from(pointersRef.current.values())[0];
    if (remainingPointer) {
      dragRef.current = { x: remainingPointer.x, y: remainingPointer.y, originX: offset.x, originY: offset.y };
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  if (markers.length === 0) {
    return (
      <div className="rounded-md border border-[#d9e2ec] bg-white p-8 text-center text-[#607085]">
        {text.search.mapEmpty}
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-md border border-[#d9e2ec] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#d9e2ec] bg-white p-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
          <HiddenPreservedFilters filters={filters} />
          <button type="submit" className="flex shrink-0 items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
            <SlidersHorizontal size={16} />
            {text.search.filters} {activeFilterCount}
          </button>

          <MapFilterShell label={filterLabel(locale, text.search.boatType, filters.category)} active={Boolean(filters.category)}>
            <label className="grid gap-2 text-sm font-bold text-navy">
              {text.search.boatType}
              <select
                name="category"
                defaultValue={filters.category || ""}
                onChange={submitOnSelectChange}
                className="h-12 rounded-md border border-[#d9e2ec] bg-white px-3 text-base font-semibold"
              >
                <option value="">{text.common.all}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {refLabel(locale, category)}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="mt-3 w-full rounded-md bg-sky px-4 py-3 text-sm font-bold text-navy shadow-[0_4px_0_#52b8df]">
              {text.search.apply}
            </button>
          </MapFilterShell>

          <MapFilterShell label={rangeLabel(text.common.price, filters.priceMin, filters.priceMax, " CHF")} active={Boolean(filters.priceMin || filters.priceMax)}>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-sm font-bold text-navy">
                {text.search.priceMin}
                <input
                  name="priceMin"
                  type="number"
                  defaultValue={filters.priceMin ?? ""}
                  placeholder="0"
                  className="h-12 rounded-md border border-[#d9e2ec] px-3 text-base"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-navy">
                {text.search.priceMax}
                <input
                  name="priceMax"
                  type="number"
                  defaultValue={filters.priceMax ?? ""}
                  placeholder="500000"
                  className="h-12 rounded-md border border-[#d9e2ec] px-3 text-base"
                />
              </label>
            </div>
            <button type="submit" className="mt-3 w-full rounded-md bg-sky px-4 py-3 text-sm font-bold text-navy shadow-[0_4px_0_#52b8df]">
              {text.search.apply}
            </button>
          </MapFilterShell>

          <MapFilterShell label={rangeLabel(text.common.year, filters.yearMin, filters.yearMax)} active={Boolean(filters.yearMin || filters.yearMax)}>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-sm font-bold text-navy">
                {text.search.yearMin}
                <input
                  name="yearMin"
                  type="number"
                  defaultValue={filters.yearMin ?? ""}
                  placeholder="1900"
                  className="h-12 rounded-md border border-[#d9e2ec] px-3 text-base"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-navy">
                {text.search.yearMax}
                <input
                  name="yearMax"
                  type="number"
                  defaultValue={filters.yearMax ?? ""}
                  placeholder="2026"
                  className="h-12 rounded-md border border-[#d9e2ec] px-3 text-base"
                />
              </label>
            </div>
            <button type="submit" className="mt-3 w-full rounded-md bg-sky px-4 py-3 text-sm font-bold text-navy shadow-[0_4px_0_#52b8df]">
              {text.search.apply}
            </button>
          </MapFilterShell>

          <MapFilterShell label={rangeLabel(text.common.length, filters.lengthMin, filters.lengthMax, " m")} active={Boolean(filters.lengthMin || filters.lengthMax)}>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-sm font-bold text-navy">
                {text.search.lengthMin}
                <input
                  name="lengthMin"
                  type="number"
                  step="0.1"
                  defaultValue={filters.lengthMin ?? ""}
                  placeholder="0"
                  className="h-12 rounded-md border border-[#d9e2ec] px-3 text-base"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-navy">
                {text.search.lengthMax}
                <input
                  name="lengthMax"
                  type="number"
                  step="0.1"
                  defaultValue={filters.lengthMax ?? ""}
                  placeholder="40"
                  className="h-12 rounded-md border border-[#d9e2ec] px-3 text-base"
                />
              </label>
            </div>
            <button type="submit" className="mt-3 w-full rounded-md bg-sky px-4 py-3 text-sm font-bold text-navy shadow-[0_4px_0_#52b8df]">
              {text.search.apply}
            </button>
          </MapFilterShell>

          <MapFilterShell label={filterLabel(locale, text.search.fuel, filters.fuelType)} active={Boolean(filters.fuelType)}>
            <label className="grid gap-2 text-sm font-bold text-navy">
              {text.search.fuel}
              <select
                name="fuelType"
                defaultValue={filters.fuelType || ""}
                onChange={submitOnSelectChange}
                className="h-12 rounded-md border border-[#d9e2ec] bg-white px-3 text-base font-semibold"
              >
                <option value="">{text.common.all}</option>
                {fuelTypes.map((fuelType) => (
                  <option key={fuelType} value={fuelType}>
                    {refLabel(locale, fuelType)}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="mt-3 w-full rounded-md bg-sky px-4 py-3 text-sm font-bold text-navy shadow-[0_4px_0_#52b8df]">
              {text.search.apply}
            </button>
          </MapFilterShell>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-[#d9e2ec] bg-white p-1 min-[720px]:flex">
          <Link href={{ pathname: "/boats", query: { view: "cards" } }} locale={locale} className="rounded-full p-2 text-navy">
            <Grid2X2 size={18} />
          </Link>
          <Link href={{ pathname: "/boats", query: { view: "list" } }} locale={locale} className="rounded-full p-2 text-navy">
            <List size={18} />
          </Link>
        </div>
      </div>

      <div
        ref={mapRef}
        className="relative h-[72vh] min-h-[560px] touch-none select-none overflow-hidden bg-white md:min-h-[680px]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onDoubleClick={() => zoomBy(1)}
      >
        <CleanSwissMapLayer zoom={zoom} viewport={viewport} />

        <div className="absolute right-4 top-1/2 z-20 grid -translate-y-1/2 overflow-hidden rounded-md border border-[#d9e2ec] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => zoomBy(1)}
            className="grid size-12 place-items-center border-b border-[#d9e2ec] text-navy"
            aria-label={text.search.mapZoomIn}
          >
            <Plus size={22} />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(-1)}
            className="grid size-12 place-items-center text-navy"
            aria-label={text.search.mapZoomOut}
          >
            <Minus size={22} />
          </button>
        </div>

        {markers.map((marker) => {
          const left = lngToX(marker.lng, zoom) - viewport.left;
          const top = latToY(marker.lat, zoom) - viewport.top;
          const isActive = marker.key === activeMarker?.key;

          if (left < -80 || left > size.width + 80 || top < -80 || top > size.height + 80) return null;

          return (
            <button
              key={marker.key}
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setActiveKey(marker.key)}
              className={`absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-sm font-black shadow-lg ring-2 ring-white transition ${
                isActive ? "size-12 bg-black text-white" : "size-10 bg-[#006d77] text-white hover:bg-black"
              }`}
              style={{ left, top }}
              aria-label={`${marker.label}: ${marker.listings.length}`}
            >
              {formatMarkerCount(marker.listings.length)}
            </button>
          );
        })}

        {activeMarker ? (
          <aside className="absolute bottom-20 left-4 z-20 w-[min(420px,calc(100%-2rem))] overflow-hidden rounded-md border border-[#d9e2ec] bg-white shadow-2xl md:bottom-6 md:left-auto md:right-20">
            <div className="border-b border-[#d9e2ec] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#607085]">
                <MapPin size={16} />
                {activeMarker.label}
              </p>
              <h2 className="mt-1 text-2xl font-black text-navy">
                {activeMarker.listings.length} {text.search.mapListings}
              </h2>
            </div>
            <div className="grid max-h-[360px] gap-2 overflow-auto p-3">
              {activeMarker.listings.map((listing) => {
                const primary = listing.images.find((image) => image.isPrimary) || listing.images[0];

                return (
                  <Link
                    key={listing.id}
                    href={`/listing/${listing.slug}`}
                    locale={locale}
                    className="grid grid-cols-[100px_1fr] gap-3 rounded-md border border-[#d9e2ec] bg-white p-2 transition hover:border-sky"
                  >
                    {primary ? (
                      <img src={primary.url} alt={primary.alt} className="h-24 w-[100px] rounded object-cover" />
                    ) : (
                      <span className="grid h-24 w-[100px] place-items-center rounded bg-[#eef7fc] text-navy">
                        <ShipWheel size={28} />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-navy">{listing.title}</span>
                      <span className="mt-1 block text-sm text-[#607085]">
                        {listing.year} · {listing.lengthM} m · {refLabel(locale, listing.category)}
                      </span>
                      <span className="mt-2 block text-lg font-black text-navy">{formatChf(listing.priceChf)}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </aside>
        ) : null}

        <Link
          href={{ pathname: "/boats", query: { view: "list" } }}
          locale={locale}
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white shadow-xl"
        >
          <List size={18} />
          {text.search.mapShowList}
        </Link>
      </div>
    </section>
  );
}
