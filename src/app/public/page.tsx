"use client";
import React from "react";
import { getPublicSteps } from "@/lib/public-progress";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function PublicHome() {
  const steps = getPublicSteps();
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Work In Progress</h1>
        <p className="text-muted-foreground">Acompanha aqui, em tempo real, os passos do próximo lançamento.</p>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((s) => (
          <Card key={s.slug} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{s.name}</span>
                <span className="text-xs font-medium rounded bg-muted px-2 py-0.5 text-muted-foreground">{s.timeframe}</span>
              </CardTitle>
              <CardDescription>{s.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">{s.status.replace("-", " ")}</span>
                <span>{s.percent}%</span>
              </div>
              <Progress value={s.percent} />
              <div className="pt-1">
                <Button asChild variant="outline" size="sm">
                  <a href={s.link}>Ver progresso</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
