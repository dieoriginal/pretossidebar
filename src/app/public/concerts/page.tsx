import React from "react";
import { concerts } from "@/lib/public-catalog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConcertsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Concertos</h1>
        <p className="text-muted-foreground">Datas, locais e links para bilhetes.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {concerts.map((c) => (
          <Card key={c.slug}>
            <CardHeader>
              <CardTitle>{c.title}</CardTitle>
              <CardDescription>
                {new Date(c.date).toLocaleDateString()} • {c.city ?? ''} {c.venue ? `• ${c.venue}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm capitalize text-muted-foreground">{c.status.replace('-', ' ')}</span>
              {c.ticketUrl ? (
                <Button asChild size="sm" variant="outline"><a href={c.ticketUrl} target="_blank">Bilhetes</a></Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
