import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseClient } from 'shared-logic';

// Lazy load Stripe
function getStripe() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  try {
    const StripeLib = require('stripe');
    return new StripeLib(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const splitId = params.id;
    const supabase = getSupabaseClient();
    const stripe = getStripe();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe não configurado' },
        { status: 500 }
      );
    }

    // Obter split
    const { data: split, error: splitError } = await supabase
      .from('payment_splits')
      .select('*, events!inner(artist_id)')
      .eq('id', splitId)
      .single();

    if (splitError || !split) {
      return NextResponse.json(
        { error: 'Split não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if ((split.events as any).artist_id !== userId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    if (split.split_status !== 'pending') {
      return NextResponse.json(
        { error: 'Split já foi processado' },
        { status: 400 }
      );
    }

    // Obter payouts pendentes
    const { data: payouts, error: payoutsError } = await supabase
      .from('split_payouts')
      .select('*, event_staff!inner(stripe_connect_account_id, bank_account_setup)')
      .eq('payment_split_id', splitId)
      .eq('status', 'pending');

    if (payoutsError) {
      return NextResponse.json(
        { error: 'Erro ao buscar payouts' },
        { status: 500 }
      );
    }

    // Processar cada payout
    const results = [];
    for (const payout of payouts || []) {
      const staff = payout.event_staff as any;
      
      if (!staff.stripe_connect_account_id || !staff.bank_account_setup) {
        results.push({
          payout_id: payout.id,
          status: 'failed',
          error: 'Conta bancária não configurada',
        });
        continue;
      }

      try {
        // Criar transfer no Stripe Connect
        const transfer = await stripe.transfers.create({
          amount: Math.round(payout.amount * 100), // Converter para centavos
          currency: payout.currency || 'eur',
          destination: staff.stripe_connect_account_id,
          metadata: {
            event_id: split.event_id,
            payout_id: payout.id,
            staff_id: payout.staff_id,
          },
        });

        // Atualizar payout
        await supabase
          .from('split_payouts')
          .update({
            stripe_transfer_id: transfer.id,
            status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payout.id);

        results.push({
          payout_id: payout.id,
          status: 'processing',
          transfer_id: transfer.id,
        });
      } catch (stripeError: any) {
        console.error('Erro ao processar payout:', stripeError);
        
        await supabase
          .from('split_payouts')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payout.id);

        results.push({
          payout_id: payout.id,
          status: 'failed',
          error: stripeError.message,
        });
      }
    }

    // Atualizar status do split
    const allProcessed = results.every((r) => r.status === 'processing' || r.status === 'completed');
    const anyFailed = results.some((r) => r.status === 'failed');

    let newStatus = 'processing';
    if (allProcessed) {
      newStatus = 'completed';
    } else if (anyFailed) {
      newStatus = 'processing'; // Ainda processando outros
    }

    await supabase
      .from('payment_splits')
      .update({
        split_status: newStatus,
        processed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', splitId);

    return NextResponse.json({
      success: true,
      results,
      split_status: newStatus,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro no processamento de split:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
