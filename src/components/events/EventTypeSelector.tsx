"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Building2, 
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Database,
  Music
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents, createEmptyEvent } from "@/hooks/use-events";

export type EventType = 
  | "yearly-templates"
  | "single-concert"
  | "third-party-hired"
  | "mini-tour";

interface EventTypeOption {
  id: EventType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const EVENT_TYPES: EventTypeOption[] = [
  {
    id: "yearly-templates",
    label: "Sistema de Templates Anuais",
    description: "Use templates pré-configurados para eventos recorrentes ao longo do ano",
    icon: Calendar,
    href: "/events",
    color: "bg-blue-500",
  },
  {
    id: "single-concert",
    label: "Concerto Único (Off the DOM)",
    description: "Planeie um concerto único, independente de templates ou séries",
    icon: Sparkles,
    href: "/events", // Será sobrescrito para criar evento direto
    color: "bg-purple-500",
  },
  {
    id: "third-party-hired",
    label: "Evento Contratado por Terceiros",
    description: "Evento onde você é contratado por outra entidade/organização",
    icon: Building2,
    href: "/events",
    color: "bg-green-500",
  },
  {
    id: "mini-tour",
    label: "Mini-Digressão / Tour",
    description: "Planeie uma digressão com múltiplas paragens e locais",
    icon: MapPin,
    href: "/minitour",
    color: "bg-orange-500",
  },
];

export function EventTypeSelector() {
  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { setCurrentEvent } = useEvents();

  const handleSelect = (type: EventTypeOption) => {
    setSelectedType(type.id);
  };

  const handleContinue = async () => {
    if (!selectedType) return;
    
    const option = EVENT_TYPES.find(opt => opt.id === selectedType);
    if (!option) return;

    // Se for "single-concert", criar evento diretamente e ir para o fluxograma
    if (selectedType === "single-concert") {
      setIsCreating(true);
      try {
        // Criar um novo evento com tipo "concerto" usando createEmptyEvent
        const newEventId = `event_${Date.now()}`;
        const newEvent = createEmptyEvent(newEventId);
        
        // Configurar como concerto único
        newEvent.overview.eventName = "Concerto Único";
        newEvent.overview.eventType = "concerto";
        newEvent.overview.date = new Date().toISOString().split('T')[0];

        // Salvar o evento usando o hook
        setCurrentEvent(newEvent);
        
        // Marcar como "single-concert" no localStorage para a página de evento saber que é off the DOM
        localStorage.setItem("selectedEventType", "single-concert");
        localStorage.setItem("eventOffTheDOM", "true");
        
        // Redirecionar direto para o fluxograma de execução
        router.push(`/events/${newEventId}`);
      } catch (error) {
        console.error("Erro ao criar evento:", error);
        setIsCreating(false);
      }
      return;
    }

    // Para outros tipos, comportamento normal
    localStorage.setItem("selectedEventType", selectedType);
    router.push(option.href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Espetáculos ao Vivo</h1>
          <p className="text-muted-foreground">
            Selecione o tipo de evento que pretende planear
          </p>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/events/fichavenues">
            <Button variant="outline" size="lg" className="gap-2">
              <Database className="w-5 h-5" />
              Gestão de Venues
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/events/fichaprodutores">
            <Button variant="outline" size="lg" className="gap-2">
              <Music className="w-5 h-5" />
              Gestão de Produtores
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EVENT_TYPES.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.id;
            
            return (
              <Card
                key={option.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg",
                  isSelected && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => handleSelect(option)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "p-3 rounded-lg",
                      option.color,
                      "text-white"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardTitle className="mt-4">{option.label}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedType || isCreating}
            className="min-w-[200px]"
          >
            {isCreating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Criando evento...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {selectedType && (
          <div className="text-center text-sm text-muted-foreground">
            <Badge variant="outline" className="mt-2">
              {EVENT_TYPES.find(opt => opt.id === selectedType)?.label}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}



