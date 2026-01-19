"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/commerce/types";
import { getProduct } from "@/lib/commerce/api/local";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!params.slug) return;
      try {
        const data = await getProduct(params.slug);
        setProduct(data);
        if (data?.variants?.[0]) {
          setSelectedVariant(data.variants[0].id);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">A carregar produto...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
            <Button asChild>
              <Link href="/merch">Voltar à loja</Link>
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const variant = product.variants.find((v) => v.id === selectedVariant) || product.variants[0];
  const price = variant?.price || product.price;
  const formattedPrice = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: price?.currencyCode || "EUR",
  }).format(price?.value || 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href="/merch">← Voltar</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {product.images?.[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].altText || product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-muted-foreground">Sem imagem</span>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              {product.vendor && (
                <p className="text-muted-foreground">por {product.vendor}</p>
              )}
            </div>

            <div>
              <p className="text-3xl font-bold">{formattedPrice}</p>
            </div>

            {product.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Descrição</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {product.variants.length > 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Variantes</h2>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <Button
                      key={v.id}
                      variant={selectedVariant === v.id ? "default" : "outline"}
                      onClick={() => setSelectedVariant(v.id)}
                    >
                      {v.name || `Variante ${v.id}`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button size="lg" className="w-full" disabled={!variant?.availableForSale}>
                {variant?.availableForSale ? "Adicionar ao Carrinho" : "Indisponível"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}




















