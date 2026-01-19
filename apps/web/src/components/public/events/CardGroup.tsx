"use client";

import React from "react";
import { Heading } from "./Heading";
import { cn } from "@/lib/utils";

interface CardGroupProps {
  children: React.ReactNode;
  title: string;
  color?: "blue" | "red" | "orange" | "purple";
  background?: "white" | "gray";
  className?: string;
}

export function CardGroup({
  children,
  title,
  color = "blue",
  background = "white",
  className,
}: CardGroupProps) {
  return (
    <section
      className={cn(
        "py-12",
        background === "gray" && "bg-muted",
        background === "white" && "bg-background",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Heading
            type={2}
            color={background === "gray" ? "foreground" : "muted"}
            text={title}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </section>
  );
}




















