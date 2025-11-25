import React from "react";
import { merch } from "@/lib/public-catalog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MerchPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Merch</h1>
        <p className="text-muted-foreground">Programa de Merch — novidades e disponibilidade.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {merch.map((m) => (
          <Card key={m.slug} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="relative h-20 w-20 rounded bg-muted flex-shrink-0 overflow-hidden">
                {m.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imageUrl} alt={m.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">{m.name}</CardTitle>
                <CardDescription>
                  {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(m.price)}
                  {` • ${m.status.replace('-', ' ')}`}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {m.buyUrl ? (
                <Button asChild size="sm" variant="outline"><a href={m.buyUrl} target="_blank">Comprar</a></Button>
              ) : (
                <span className="text-sm text-muted-foreground">Em breve</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
