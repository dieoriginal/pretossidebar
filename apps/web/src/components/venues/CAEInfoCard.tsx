"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { CAES_VENUES } from "@/lib/concelhos";

export function CAEInfoCard() {
  const [expanded, setExpanded] = useState(false);

  const copyCAETable = () => {
    const table = CAES_VENUES.map(cae => 
      `${cae.code}\t${cae.description}\t${cae.agreement}`
    ).join("\n");
    
    const text = `CAEs — Tabela de Referência\n\nCAE\tDescrição\tPossibilidade de 70-30\n${table}\n\n📌 Na prática:\n\n🟢 CAEs 90040 e 93290 são os mais "promoter-friendly" — ideais para pedir splits 70–30 (ou até 80–20 se a tua equipa tratar de tudo: booking, promoção, staff, etc.).\n\n🟡 CAEs de bares / restauração (ex. 56302) normalmente preferem aluguer fixo da sala ou consumo mínimo — dificilmente aceitam splits.\n\n🟡 CAEs turísticos (ex. 93293) podem aceitar splits, mas geralmente pedem contrapartidas em promoção ou animação.`;
    
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>CAEs — Tabela Rápida</CardTitle>
            <CardDescription>
              Resumo por CAE: descrição, típicos de uso e probabilidade de acordo 70–30
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyCAETable}>
              <Copy className="w-4 h-4 mr-1" />
              Copiar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-mono">CAE</th>
                  <th className="text-left p-2">Descrição</th>
                  <th className="text-left p-2">Típico para</th>
                  <th className="text-left p-2">Possibilidade de 70-30</th>
                </tr>
              </thead>
              <tbody>
                {CAES_VENUES.map((cae) => (
                  <tr key={cae.code} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono font-medium">{cae.code}</td>
                    <td className="p-2">{cae.description}</td>
                    <td className="p-2 text-muted-foreground">
                      {cae.code === "90040" && "Teatros, auditórios, venues licenciadas para espetáculos ao vivo"}
                      {cae.code === "93290" && "Salas polivalentes, espaços culturais independentes, venues alternativas"}
                      {cae.code === "56302" && "Bares e clubes que fazem eventos ocasionais"}
                      {cae.code === "93293" && "Espaços/eventos temporários, festivais de verão, sunset spots"}
                      {cae.code === "90010" && "Promotores ou venues que produzem os seus próprios eventos"}
                      {cae.code === "93210" && "Espaços culturais híbridos, coletivos, open-air"}
                    </td>
                    <td className="p-2">
                      <Badge
                        variant={
                          cae.agreement.includes("🟢") ? "default" :
                          cae.agreement.includes("🟡") ? "secondary" : "outline"
                        }
                      >
                        {cae.agreement}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="pt-4 border-t space-y-3">
            <h4 className="font-semibold text-sm">📌 Na prática</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">🟢</span>
                <p>
                  <strong>CAEs 90040 e 93290</strong> são os mais "promoter-friendly" — ideais para pedir splits 70–30 (ou até 80–20 se a tua equipa tratar de tudo: booking, promoção, staff, etc.).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400">🟡</span>
                <p>
                  <strong>CAEs de bares / restauração (ex. 56302)</strong> normalmente preferem aluguer fixo da sala ou consumo mínimo — dificilmente aceitam splits.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400">🟡</span>
                <p>
                  <strong>CAEs turísticos (ex. 93293)</strong> podem aceitar splits, mas geralmente pedem contrapartidas em promoção ou animação (ex.: divulgação, acts adicionais, pacotes turísticos).
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic mt-4">
              Nota: estes são padrões práticos — sempre confirma durante a chamada (modelo de remuneração, responsabilidades de promoção e custos técnicos).
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}












