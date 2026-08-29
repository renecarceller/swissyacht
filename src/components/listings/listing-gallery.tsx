"use client";

import Image from "next/image";
import { useState } from "react";
import type { ListingImage } from "@/types/domain";

export function ListingGallery({ images }: { images: ListingImage[] }) {
  const [selectedId, setSelectedId] = useState(images[0]?.id);
  const selected = images.find((image) => image.id === selectedId) || images[0];

  if (!selected) return null;

  return (
    <div className="overflow-hidden rounded-md border border-[#d9e2ec] bg-white">
      <div className="relative h-[420px] w-full bg-[#eef6fc]">
        <Image
          src={selected.url}
          alt={selected.alt}
          fill
          priority
          unoptimized
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-3 gap-2 p-2">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedId(image.id)}
              className={`overflow-hidden rounded border text-left transition ${image.id === selected.id ? "border-[#8bd3ff] ring-2 ring-[#8bd3ff]" : "border-transparent hover:border-[#cbd7e4]"}`}
              aria-label={image.alt}
            >
              <span className="relative block h-28 w-full bg-[#eef6fc]">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 33vw, 280px"
                  className="object-cover"
                />
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
