"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { UpdateBankAccountRequest } from 'shared-logic';

export default function StaffAcceptPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [staff, setStaff] = useState<any>(null);
  const [bankData, setBankData] = useState<UpdateBankAccountRequest>({
    iban: '',
    swift: '',
    account_name: '',
  });

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    // Buscar informações do convite
    fetch(`/api/staff/${params.id}?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          router.push('/');
        } else {
          setStaff(data);
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar convite:', err);
        router.push('/');
      });
  }, [token, params.id, router]);

  const handleAccept = async () => {
    if (!user || !isLoaded) {
      alert('Por favor, faça login primeiro');
      router.push('/sign-in');
      return;
    }

    setAccepting(true);
    try {
      const response = await fetch(`/api/staff/${params.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao aceitar convite');
      }

      const data = await response.json();
      setStaff(data);
      alert('Convite aceito com sucesso! Agora configure sua conta bancária.');
    } catch (error: any) {
      alert(error.message || 'Erro ao aceitar convite');
    } finally {
      setAccepting(false);
    }
  };

  const handleBankSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/staff/${params.id}/bank-account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao configurar conta bancária');
      }

      const data = await response.json();
      
      if (data.onboarding_url) {
        // Redirecionar para onboarding do Stripe
        window.location.href = data.onboarding_url;
      } else {
        alert('Conta bancária configurada com sucesso!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao configurar conta bancária');
    } finally {
      setLoading(false);
    }
  };

  if (!staff) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="mt-4">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Convite de Staff</CardTitle>
          <CardDescription>
            Você foi convidado para participar do evento como {staff.role}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {staff.status === 'invited' && (
            <div>
              <p className="mb-4">
                Você receberá {staff.split_type === 'percentage' 
                  ? `${staff.split_value}%` 
                  : `€${staff.split_value}`} da receita do evento.
              </p>
              {!user || !isLoaded ? (
                <Button onClick={() => router.push('/sign-in')}>
                  Fazer Login para Aceitar
                </Button>
              ) : (
                <Button onClick={handleAccept} disabled={accepting}>
                  {accepting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aceitando...
                    </>
                  ) : (
                    'Aceitar Convite'
                  )}
                </Button>
              )}
            </div>
          )}

          {staff.status === 'accepted' && !staff.bank_account_setup && (
            <form onSubmit={handleBankSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={bankData.iban}
                  onChange={(e) => setBankData({ ...bankData, iban: e.target.value })}
                  placeholder="PT50000000000000000000000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="swift">SWIFT (opcional)</Label>
                <Input
                  id="swift"
                  value={bankData.swift}
                  onChange={(e) => setBankData({ ...bankData, swift: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_name">Nome da Conta</Label>
                <Input
                  id="account_name"
                  value={bankData.account_name}
                  onChange={(e) => setBankData({ ...bankData, account_name: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  'Configurar Conta Bancária'
                )}
              </Button>
            </form>
          )}

          {staff.bank_account_setup && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-800 dark:text-green-200">
                ✓ Conta bancária configurada com sucesso!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Você receberá o pagamento automaticamente após o evento ser concluído.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
