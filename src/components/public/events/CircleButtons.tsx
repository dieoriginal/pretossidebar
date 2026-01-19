"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CircleButton {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface CircleButtonsProps {
  buttons?: CircleButton[];
}

const defaultButtons: CircleButton[] = [
  { label: "Todos", active: true },
  { label: "Próximos" },
  { label: "Passados" },
];

export function CircleButtons({ buttons = defaultButtons }: CircleButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.active ? "default" : "outline"}
          size="sm"
          onClick={button.onClick}
          className={cn(
            "rounded-full",
            button.active && "bg-primary text-primary-foreground"
          )}
        >
          {button.label}
        </Button>
      ))}
    </div>
  );
}




















