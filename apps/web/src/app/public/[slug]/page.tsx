"use client";
import React from "react";
import { notFound, useParams } from "next/navigation";
import { getPublicStep } from "@/lib/public-progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function PublicStepPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const step = getPublicStep(slug);
  if (!step) return notFound();
  return (
    <div className="space-y-6">
      <div>
        <a href="/public" className="text-sm text-muted-foreground hover:underline">← Voltar</a>
      </div>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{step.name}</h1>
        <p className="text-muted-foreground">{step.description}</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progresso</span>
            <span className="text-xs font-medium rounded bg-muted px-2 py-0.5 text-muted-foreground">{step.timeframe}</span>
          </CardTitle>
          <CardDescription>Status: <span className="capitalize">{step.status}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Concluído</span>
            <span>{step.percent}%</span>
          </div>
          <Progress value={step.percent} />
        </CardContent>
      </Card>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Notas</h2>
        <p className="text-sm text-muted-foreground">Este espaço pode incluir clips, fotos, e marcos objetivos à medida que avançamos.</p>
      </section>
    </div>
  );
}
