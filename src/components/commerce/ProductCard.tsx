"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "slim";
  imgProps?: {
    width?: number;
    height?: number;
    priority?: boolean;
    alt?: string;
  };
  className?: string;
}

export function ProductCard({
  product,
  variant = "default",
  imgProps,
  className,
}: ProductCardProps) {
  const image = product.images?.[0];
  const price = product.price;
  const formattedPrice = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: price?.currencyCode || "EUR",
  }).format(price?.value || 0);

  return (
    <Link
      href={`/merch/${product.slug || product.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg",
        variant === "slim" && "flex-row",
        className
      )}
    >
      <div
        className={cn(
          "relative flex-shrink-0 overflow-hidden bg-muted",
          variant === "slim" ? "h-24 w-24" : "aspect-square"
        )}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.altText || product.name}
            width={imgProps?.width || (variant === "slim" ? 96 : 400)}
            height={imgProps?.height || (variant === "slim" ? 96 : 400)}
            priority={imgProps?.priority}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground">Sem imagem</span>
          </div>
        )}
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col p-4",
          variant === "slim" && "justify-center"
        )}
      >
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        {product.description && variant !== "slim" && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-2">
          <p className="text-lg font-bold">{formattedPrice}</p>
        </div>
      </div>
    </Link>
  );
}




















