"use client";

import React, { useEffect, useState } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Grid } from "@/components/commerce/Grid";
import { Marquee } from "@/components/commerce/Marquee";
import { Hero } from "@/components/commerce/Hero";
import { Product } from "@/lib/commerce/types";
import { getAllProducts } from "@/lib/commerce/api/local";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

export default function MerchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">A carregar produtos...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Hero
          headline="Merch Die Pretty"
          description="Descobre a nossa coleção exclusiva de produtos. Qualidade premium, design único."
        />

        <Grid variant="filled">
          {products.slice(0, 3).map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              imgProps={{
                alt: product.name,
                width: i === 0 ? 1080 : 540,
                height: i === 0 ? 1080 : 540,
                priority: true,
              }}
            />
          ))}
        </Grid>

        <Marquee variant="secondary" className="my-8">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} variant="slim" />
          ))}
        </Marquee>

        <Hero
          headline="Coleção Completa"
          description="Todos os produtos disponíveis"
        />

        <Grid layout="B" variant="filled">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              imgProps={{
                alt: product.name,
                width: i === 1 ? 1080 : 540,
                height: i === 1 ? 1080 : 540,
              }}
            />
          ))}
        </Grid>

        {products.length > 3 && (
          <Marquee className="my-8">
            {products.slice(3).map((product) => (
              <ProductCard key={product.id} product={product} variant="slim" />
            ))}
          </Marquee>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}




















