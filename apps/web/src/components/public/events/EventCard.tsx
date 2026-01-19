"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  id: string;
  name: string;
  date: string;
  venue?: string;
  city?: string;
  image?: string;
  price?: number;
  status?: "announced" | "on-sale" | "sold-out" | "completed" | "cancelled";
  ticketUrl?: string;
  color?: "blue" | "red" | "orange" | "purple";
  isPast?: boolean;
}

export function EventCard({
  id,
  name,
  date,
  venue,
  city,
  image,
  price,
  status = "announced",
  ticketUrl,
  color = "blue",
  isPast = false,
}: EventCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedPrice = price
    ? new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      }).format(price)
    : null;

  const statusColors = {
    announced: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "on-sale": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "sold-out": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    cancelled: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };

  const statusLabels = {
    announced: "Anunciado",
    "on-sale": "À venda",
    "sold-out": "Esgotado",
    completed: "Realizado",
    cancelled: "Cancelado",
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
      <Link href={`/public/concerts/${id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Calendar className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          {!isPast && status !== "completed" && (
            <div className="absolute top-2 right-2">
              <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
            </div>
          )}
          {isPast && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="bg-background/80">
                Passado
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-2 font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
            {name}
          </h3>

          <div className="mt-auto space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{formattedDate}</span>
            </div>
            {(venue || city) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="line-clamp-1">
                  {venue && city ? `${venue}, ${city}` : venue || city}
                </span>
              </div>
            )}
            {formattedPrice && (
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 flex-shrink-0" />
                <span className="font-semibold text-foreground">a partir de {formattedPrice}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="border-t p-4">
        {isPast || status === "completed" ? (
          <Button asChild variant="outline" className="w-full" size="sm">
            <Link href={`/public/concerts/${id}`}>Ver Detalhes</Link>
          </Button>
        ) : ticketUrl ? (
          <Button asChild className="w-full bg-primary hover:bg-primary/90" size="sm">
            <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
              Comprar Bilhetes
            </a>
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-full" size="sm">
            <Link href={`/public/concerts/${id}`}>Ver Detalhes</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

