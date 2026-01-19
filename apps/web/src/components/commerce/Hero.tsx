"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface HeroProps {
  headline: string;
  description?: string;
  className?: string;
}

export function Hero({ headline, description, className }: HeroProps) {
  return (
    <section
      className={cn(
        "relative flex flex-col items-center justify-center py-20 text-center",
        className
      )}
    >
      <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
        {headline}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {description}
        </p>
      )}
    </section>
  );
}




















