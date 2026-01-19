"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ChecklistItem = {
  key: string;
  label: string;
  category: "remuneration" | "logistics" | "technical" | "financial" | "legal" | "contacts";
};

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Modelo de remuneração
  { key: "remuneration_model", label: "Modelo de remuneração: flat, % bilheteira, bar split, mínimo garantido", category: "remuneration" },
  
  // Capacidade e configuração
  { key: "capacity", label: "Capacidade confirmada da sala e configuração (plateia/mesas)", category: "logistics" },
  
  // Horários
  { key: "opening_hours", label: "Horários: abertura/fecho e curfew/licenças", category: "logistics" },
  
  // Load-in/out
  { key: "load_in_out", label: "Janela de load-in/load-out e acessos (carrinha, elevador)", category: "logistics" },
  
  // Infra técnica
  { key: "technical_infra", label: "Infra técnica: PA/monição, backline, iluminação; disponibilidade de técnicos e custos", category: "technical" },
  
  // Bilheteira/door staff
  { key: "door_staff", label: "Bilheteira/door staff e custos", category: "technical" },
  
  // Rider técnico
  { key: "technical_rider", label: "Rider técnico/avançado: exigências e contacto para envio", category: "technical" },
  
  // Informações fiscais
  { key: "responsible_entity", label: "Entidade responsável, NIF, e condições de faturação", category: "financial" },
  
  // Pagamento
  { key: "payment", label: "Método e prazo de pagamento", category: "financial" },
  
  // SPA
  { key: "spa", label: "Nº de registo SPA/política de report (se aplicável)", category: "legal" },
  
  // Contactos
  { key: "contacts", label: "Contacto operativo (telefone) e email para press-kit/assets", category: "contacts" },
];

const CATEGORY_LABELS: Record<ChecklistItem["category"], string> = {
  remuneration: "💰 Remuneração",
  logistics: "🚚 Logística",
  technical: "🎛️ Técnico",
  financial: "💳 Financeiro",
  legal: "📋 Legal",
  contacts: "📞 Contactos",
};

export function VenueCallChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    const newChecked = new Set(checked);
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setChecked(newChecked);
  };

  const resetChecklist = () => {
    setChecked(new Set());
  };

  const copyChecklist = () => {
    const items = CHECKLIST_ITEMS.map(item => {
      const isChecked = checked.has(item.key) ? "✅" : "⬜";
      return `${isChecked} ${item.label}`;
    }).join("\n");
    
    const text = `📋 Checklist para Chamada à Venue\n\n${items}\n\nProgresso: ${checked.size}/${CHECKLIST_ITEMS.length} itens`;
    navigator.clipboard.writeText(text);
  };

  const itemsByCategory = CHECKLIST_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<ChecklistItem["category"], ChecklistItem[]>);

  const progress = Math.round((checked.size / CHECKLIST_ITEMS.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Checklist para Chamadas</CardTitle>
            <CardDescription>
              Use esta lista quando ligar às venues para garantir que recolhe todas as informações necessárias
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {checked.size}/{CHECKLIST_ITEMS.length} ({progress}%)
            </Badge>
            <Button variant="outline" size="sm" onClick={copyChecklist}>
              <Copy className="w-4 h-4 mr-1" />
              Copiar
            </Button>
            <Button variant="ghost" size="sm" onClick={resetChecklist}>
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {CATEGORY_LABELS[category as ChecklistItem["category"]]}
              <Badge variant="outline" className="text-xs">
                {items.filter(item => checked.has(item.key)).length}/{items.length}
              </Badge>
            </h3>
            <div className="space-y-2 pl-4">
              {items.map((item) => {
                const isChecked = checked.has(item.key);
                return (
                  <div key={item.key} className="flex items-start gap-2">
                    <Checkbox
                      id={item.key}
                      checked={isChecked}
                      onCheckedChange={() => toggleItem(item.key)}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={item.key}
                      className={`text-sm cursor-pointer flex-1 ${
                        isChecked ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

