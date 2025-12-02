"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Ticket,
  ShoppingBag,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateProfit, calculateScenarios, ProfitInputs } from "@/lib/profit-calculator";

interface ProfitDashboardProps {
  eventData: any;
  onUpdate?: (updates: Partial<ProfitInputs>) => void;
}

export function ProfitDashboard({ eventData, onUpdate }: ProfitDashboardProps) {
  const inputs: ProfitInputs = useMemo(() => {
    const capacity = eventData?.venues?.requiredCapacity || eventData?.overview?.capacity || 0;
    const ticketPrice = eventData?.finance?.ticketPrice || 0;
    const expectedAttendance = eventData?.finance?.expectedAttendance || 70; // 70% por padrão
    
    return {
      capacity,
      ticketPrice,
      expectedAttendance,
      sponsorship: eventData?.finance?.sponsorship || 0,
      merchPerPerson: eventData?.finance?.merchPerPerson || 5,
      venueSplit: eventData?.finance?.venueSplit || 30,
      artistFees: eventData?.lineup?.artists?.reduce((sum: number, a: any) => sum + (a.fee || 0), 0) || 0,
      productionCosts: eventData?.production?.estimatedCost || 0,
      marketingCosts: eventData?.marketing?.budget || 0,
      logisticsCosts: eventData?.logistics?.estimatedCost || 0,
      otherCosts: eventData?.finance?.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0,
    };
  }, [eventData]);

  const profit = useMemo(() => calculateProfit(inputs), [inputs]);
  const scenarios = useMemo(() => calculateScenarios(inputs), [inputs]);

  const isProfitable = profit.profit > 0;
  const isBreakEven = profit.breakEven <= inputs.capacity;

  return (
    <div className="space-y-4">
      {/* Main Profit Card */}
      <Card className={cn(
        "border-2",
        isProfitable 
          ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" 
          : "border-red-500 bg-red-50/50 dark:bg-red-900/10"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Estimativa de Lucro</CardTitle>
            <Badge className={cn(
              "text-lg px-4 py-2",
              isProfitable 
                ? "bg-green-500 text-white" 
                : "bg-red-500 text-white"
            )}>
              {isProfitable ? (
                <><TrendingUp className="h-4 w-4 mr-2 inline" /> Lucrativo</>
              ) : (
                <><TrendingDown className="h-4 w-4 mr-2 inline" /> Prejuízo</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profit Amount */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-2" style={{
              color: isProfitable ? '#10b981' : '#ef4444'
            }}>
              {profit.profit >= 0 ? '+' : ''}{profit.profit.toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              })}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Margem: {profit.profitMargin.toFixed(1)}% | ROI: {profit.roi.toFixed(1)}%
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Ticket className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Bilhetes</div>
              <div className="font-semibold text-blue-700 dark:text-blue-300">
                {profit.revenue.tickets.toLocaleString('pt-PT', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                })}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-2 text-purple-600" />
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Patrocínios</div>
              <div className="font-semibold text-purple-700 dark:text-purple-300">
                {profit.revenue.sponsorship.toLocaleString('pt-PT', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                })}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <ShoppingBag className="h-5 w-5 mx-auto mb-2 text-orange-600" />
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Merch</div>
              <div className="font-semibold text-orange-700 dark:text-orange-300">
                {profit.revenue.merch.toLocaleString('pt-PT', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>

          {/* Costs Breakdown */}
          <div>
            <div className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Custos Totais: {profit.costs.total.toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              })}
            </div>
            <div className="space-y-2">
              {[
                { label: 'Venue', value: profit.costs.venue },
                { label: 'Artistas', value: profit.costs.artists },
                { label: 'Produção', value: profit.costs.production },
                { label: 'Marketing', value: profit.costs.marketing },
                { label: 'Logística', value: profit.costs.logistics },
                { label: 'Outros', value: profit.costs.other },
              ].map((item) => {
                const percentage = profit.costs.total > 0 
                  ? (item.value / profit.costs.total) * 100 
                  : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{item.label}</span>
                      <span>{item.value.toLocaleString('pt-PT', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                      })} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Break Even */}
          <div className={cn(
            "p-3 rounded-lg flex items-center gap-2",
            isBreakEven 
              ? "bg-green-100 dark:bg-green-900/30" 
              : "bg-yellow-100 dark:bg-yellow-900/30"
          )}>
            {isBreakEven ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold">Break-Even</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Precisa vender {profit.breakEven} bilhetes de {inputs.capacity} disponíveis
                ({((profit.breakEven / inputs.capacity) * 100).toFixed(0)}%)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cenário Pessimista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold mb-1",
              scenarios.pessimistic.profit >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {scenarios.pessimistic.profit >= 0 ? '+' : ''}
              {scenarios.pessimistic.profit.toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-slate-500">
              {Math.floor((inputs.capacity * (inputs.expectedAttendance - 20)) / 100)} bilhetes
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cenário Realista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold mb-1",
              scenarios.realistic.profit >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {scenarios.realistic.profit >= 0 ? '+' : ''}
              {scenarios.realistic.profit.toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-slate-500">
              {Math.floor((inputs.capacity * inputs.expectedAttendance) / 100)} bilhetes
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cenário Otimista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold mb-1",
              scenarios.optimistic.profit >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {scenarios.optimistic.profit >= 0 ? '+' : ''}
              {scenarios.optimistic.profit.toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-slate-500">
              {Math.floor((inputs.capacity * (inputs.expectedAttendance + 20)) / 100)} bilhetes
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




