"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GridProps {
  children: React.ReactNode;
  variant?: "default" | "filled";
  layout?: "A" | "B" | "C" | "D";
  className?: string;
}

export function Grid({
  children,
  variant = "default",
  layout = "A",
  className,
}: GridProps) {
  const layoutClasses = {
    A: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    B: "grid-cols-1 md:grid-cols-2",
    C: "grid-cols-1 md:grid-cols-3",
    D: "grid-cols-1",
  };

  return (
    <div
      className={cn(
        "grid gap-6",
        layoutClasses[layout],
        variant === "filled" && "gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}




















