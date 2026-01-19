"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { cn } from "@/lib/utils";

interface EventCalendarProps {
  events: Array<{
    id: string;
    eventName: string;
    date: string;
    venue?: string;
    city?: string;
  }>;
  selectedYear: number;
  onDateClick?: (date: Date) => void;
}

// Feriados portugueses fixos
const PORTUGUESE_HOLIDAYS: Array<{ month: number; day: number; name: string }> = [
  { month: 1, day: 1, name: "Ano Novo" },
  { month: 4, day: 25, name: "Dia da Liberdade" },
  { month: 5, day: 1, name: "Dia do Trabalhador" },
  { month: 6, day: 10, name: "Dia de Portugal" },
  { month: 8, day: 15, name: "Assunção" },
  { month: 10, day: 5, name: "Implantação da República" },
  { month: 11, day: 1, name: "Todos os Santos" },
  { month: 12, day: 1, name: "Restauração" },
  { month: 12, day: 25, name: "Natal" },
];

// Função para verificar se é um dia ideal para eventos
function isIdealEventDay(date: Date, currentMonth: Date): { isIdeal: boolean; reason: string } {
  const day = date.getDate();
  const dayOfWeek = getDay(date); // 0 = Domingo, 6 = Sábado
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Verificar se a data pertence ao mês atual
  const isCurrentMonth = date.getMonth() === currentMonth.getMonth() && 
                         date.getFullYear() === currentMonth.getFullYear();
  
  // Se não for do mês atual, não é ideal
  if (!isCurrentMonth) {
    return { isIdeal: false, reason: "" };
  }

  // Obter o último dia do mês atual
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  // Dias 28-31 (fim do mês - pessoas já receberam) - apenas se o mês tiver esses dias
  if (day >= 28 && day <= lastDayOfMonth && day === lastDayOfMonth) {
    return { isIdeal: true, reason: "Fim do mês - pessoas já receberam" };
  }

  // Dias 1-4 (início do mês)
  if (day >= 1 && day <= 4) {
    return { isIdeal: true, reason: "Início do mês" };
  }

  // Sextas-feiras (para eventos no sábado)
  if (dayOfWeek === 5) {
    return { isIdeal: true, reason: "Sexta - ideal para evento no sábado" };
  }

  // Sábados (para eventos no domingo)
  if (dayOfWeek === 6) {
    return { isIdeal: true, reason: "Sábado - ideal para evento no domingo" };
  }

  // Verificar se é feriado ou próximo de feriado (fins de semana prolongados)
  const isHoliday = PORTUGUESE_HOLIDAYS.some(
    (h) => h.month === month && h.day === day
  );

  if (isHoliday) {
    return { isIdeal: true, reason: "Feriado" };
  }

  // Verificar se está próximo de um feriado (fins de semana prolongados)
  const nextDay = addDays(date, 1);
  const prevDay = subDays(date, 1);
  const isNearHoliday = PORTUGUESE_HOLIDAYS.some((h) => {
    const holidayDate = new Date(date.getFullYear(), h.month - 1, h.day);
    return (
      isSameDay(nextDay, holidayDate) ||
      isSameDay(prevDay, holidayDate) ||
      isSameDay(date, holidayDate)
    );
  });

  if (isNearHoliday && (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0)) {
    return { isIdeal: true, reason: "Fim de semana prolongado" };
  }

  return { isIdeal: false, reason: "" };
}

export function EventCalendar({ events, selectedYear, onDateClick }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedYear, 0, 1));

  // Atualizar mês quando o ano mudar
  useEffect(() => {
    const currentMonthNum = currentMonth.getMonth();
    setCurrentMonth(new Date(selectedYear, currentMonthNum, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // Agrupar eventos por data
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof events> = {};
    events.forEach((event) => {
      if (event.date) {
        // Normalizar a data para meia-noite para evitar problemas de timezone
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        const dateKey = format(eventDate, "yyyy-MM-dd");
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      }
    });
    return grouped;
  }, [events]);

  // Obter todos os dias do mês atual
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    start.setHours(0, 0, 0, 0);
    const end = endOfMonth(currentMonth);
    end.setHours(0, 0, 0, 0);
    return eachDayOfInterval({ start, end }).map(day => {
      const normalized = new Date(day);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    });
  }, [currentMonth]);

  // Dias selecionados (com eventos) - normalizados
  const daysWithEvents = useMemo(() => {
    return Object.keys(eventsByDate).map((dateStr) => {
      const date = new Date(dateStr + "T00:00:00");
      date.setHours(0, 0, 0, 0);
      return date;
    });
  }, [eventsByDate]);

  // Dias ideais para eventos (apenas do mês atual) - normalizados
  const idealDays = useMemo(() => {
    const ideal: Date[] = [];
    monthDays.forEach((day) => {
      const normalized = new Date(day);
      normalized.setHours(0, 0, 0, 0);
      const { isIdeal } = isIdealEventDay(normalized, currentMonth);
      if (isIdeal) {
        ideal.push(normalized);
      }
    });
    return ideal;
  }, [monthDays, currentMonth]);

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const customDayClassNames = (date: Date) => {
    // Normalizar a data para comparação
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    const dateKey = format(normalizedDate, "yyyy-MM-dd");
    const hasEvent = eventsByDate[dateKey]?.length > 0;
    const isCurrentMonth = normalizedDate.getMonth() === currentMonth.getMonth() && 
                           normalizedDate.getFullYear() === currentMonth.getFullYear();
    const { isIdeal } = isIdealEventDay(normalizedDate, currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = isSameDay(normalizedDate, today);

    return cn(
      "relative",
      isToday && "ring-2 ring-primary ring-offset-2",
      !isCurrentMonth && "opacity-40 text-muted-foreground",
      hasEvent && isCurrentMonth && "bg-primary/20 font-semibold",
      isIdeal && !hasEvent && isCurrentMonth && "bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600",
      isIdeal && hasEvent && isCurrentMonth && "bg-primary/40 border-2 border-primary"
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Calendário de Eventos — {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMonthChange("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMonthChange("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentMonth(new Date(selectedYear, new Date().getMonth(), 1))}
            >
              Hoje
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legenda */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600" />
              <span>Dia ideal para eventos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20" />
              <span>Evento agendado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/40 border-2 border-primary" />
              <span>Evento em dia ideal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded ring-2 ring-primary ring-offset-2" />
              <span>Hoje</span>
            </div>
          </div>

          {/* Calendário */}
          <Calendar
            mode="single"
            selected={undefined}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            onSelect={(date) => {
              // Apenas permitir seleção de datas do mês atual
              if (date && date.getMonth() === currentMonth.getMonth() && 
                  date.getFullYear() === currentMonth.getFullYear()) {
                onDateClick?.(date);
              }
            }}
            className="rounded-md border"
            showOutsideDays={false}
            locale={ptBR}
            weekStartsOn={1}
            classNames={{
              day: "h-12 w-12 relative",
              day_selected: "bg-primary text-primary-foreground",
            }}
            modifiers={{
              hasEvent: daysWithEvents,
              ideal: idealDays,
            }}
            modifiersClassNames={{
              hasEvent: "bg-primary/20 font-semibold after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary",
              ideal: "bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600",
            }}
          />

          {/* Eventos do mês */}
          {Object.keys(eventsByDate).length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold">Eventos em {format(currentMonth, "MMMM yyyy", { locale: ptBR })}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(eventsByDate)
                  .filter(([dateStr]) => {
                    const eventDate = new Date(dateStr);
                    return eventDate.getMonth() === currentMonth.getMonth() &&
                           eventDate.getFullYear() === currentMonth.getFullYear();
                  })
                  .map(([dateStr, dayEvents]) => (
                    <div
                      key={dateStr}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => onDateClick?.(new Date(dateStr))}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(dateStr), "d MMM", { locale: ptBR })}
                        </Badge>
                        {isIdealEventDay(new Date(dateStr), currentMonth).isIdeal && (
                          <Sparkles className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {dayEvents.map((event) => (
                        <div key={event.id} className="space-y-1">
                          <div className="font-medium text-sm">{event.eventName}</div>
                          {(event.venue || event.city) && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {event.venue || event.city}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



