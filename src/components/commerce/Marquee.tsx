"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary";
  className?: string;
}

export function Marquee({
  children,
  variant = "default",
  className,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "relative flex overflow-x-hidden py-8",
        variant === "secondary" && "bg-muted",
        className
      )}
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {React.Children.map(children, (child, index) => (
          <div key={index} className="mx-4 flex-shrink-0 w-[300px]">
            {child}
          </div>
        ))}
      </div>
      <div className="flex animate-marquee whitespace-nowrap absolute left-full" aria-hidden="true">
        {React.Children.map(children, (child, index) => (
          <div key={index} className="mx-4 flex-shrink-0 w-[300px]">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

