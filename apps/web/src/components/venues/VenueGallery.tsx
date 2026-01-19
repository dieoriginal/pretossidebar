"use client";

import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

export function VenueGallery({ photos }: { photos?: string[] }) {
  if (!photos || photos.length === 0) return null;
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex gap-2 p-2">
        {photos.map((src, i) => (
          <div key={`${src}-${i}`} className="relative h-28 w-40 shrink-0 overflow-hidden rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
