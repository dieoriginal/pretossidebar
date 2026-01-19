"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, Users, CheckCircle2, Clock } from 'lucide-react';
import type { PaymentSplit, SplitPayout } from 'shared-logic';

interface SplitViewProps {
  eventId: string;
}

export function SplitView({ eventId }: SplitViewProps) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [split, setSplit] = useState<PaymentSplit | null>(null);
  const [payouts, setPayouts] = useState<Array<SplitPayout & { event_staff?: any }>>([]);

  useEffect(() => {
    fetchSplit();
  }, [eventId]);

  const fetchSplit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/split`);
      if (!response.ok) throw new Error('Erro ao buscar split');
      
      const data = await response.json();
      setSplit(data.split);
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error('Erro ao buscar split:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/events/${eventId}/split/calculate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao calcular split');
      }

      const data = await response.json();
      setSplit(data.split);
      setPayouts(data.payouts || []);
      alert('Split calculado com sucesso!');
    } catch (error: any) {
      alert(error.message || 'Erro ao calcular split');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (!split) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/splits/${split.id}/process`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar split');
      }

      const data = await response.json();
      alert(`Split processado! ${data.results.length} pagamentos iniciados.`);
      await fetchSplit();
    } catch (error: any) {
      alert(error.message || 'Erro ao processar split');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando split...</p>
        </CardContent>
      </Card>
    );
  }

  if (!split) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Split de Pagamento</CardTitle>
          <CardDescription>
            Calcule o split de pagamento para este evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCalculate} disabled={processing}>
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              'Calcular Split'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Split de Pagamento</CardTitle>
              <CardDescription>
                Status: <Badge variant={
                  split.split_status === 'completed' ? 'default' :
                  split.split_status === 'processing' ? 'secondary' :
                  'outline'
                }>{split.split_status}</Badge>
              </CardDescription>
            </div>
            {split.split_status === 'pending' && (
              <Button onClick={handleProcess} disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Processar Pagamentos'
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-lg font-semibold">
                €{split.total_revenue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa Plataforma</p>
              <p className="text-lg font-semibold text-red-600">
                -€{split.platform_fee?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custos</p>
              <p className="text-lg font-semibold text-red-600">
                -€{((split.venue_cost || 0) + (split.services_cost || 0)).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita Líquida</p>
              <p className="text-lg font-semibold text-green-600">
                €{split.net_revenue?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pagamentos Individuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payouts.map((payout) => {
              const staff = payout.event_staff;
              return (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{staff?.name || 'Staff'}</p>
                    <p className="text-sm text-muted-foreground">
                      {staff?.role} • {staff?.split_type === 'percentage' 
                        ? `${staff.split_value}%` 
                        : `€${staff?.split_value}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">€{payout.amount.toFixed(2)}</p>
                      <Badge variant={
                        payout.status === 'completed' ? 'default' :
                        payout.status === 'processing' ? 'secondary' :
                        'outline'
                      } className="text-xs">
                        {payout.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {payout.status === 'processing' && <Clock className="w-3 h-3 mr-1" />}
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
