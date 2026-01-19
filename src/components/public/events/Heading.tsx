"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps {
  type: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  color?: "foreground" | "muted" | "primary" | "white";
  className?: string;
}

const headingSizes = {
  1: "text-4xl md:text-5xl font-bold",
  2: "text-3xl md:text-4xl font-bold",
  3: "text-2xl md:text-3xl font-semibold",
  4: "text-xl md:text-2xl font-semibold",
  5: "text-lg md:text-xl font-medium",
  6: "text-base md:text-lg font-medium",
};

const colorClasses = {
  foreground: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  white: "text-white",
};

export function Heading({ type, text, color = "foreground", className }: HeadingProps) {
  const Tag = `h${type}` as keyof JSX.IntrinsicElements;
  return (
    <Tag
      className={cn(
        headingSizes[type],
        colorClasses[color],
        className
      )}
    >
      {text}
    </Tag>
  );
}




















