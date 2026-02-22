import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseClient } from 'shared-logic';

type UpdateBankAccountRequest = {
  iban: string;
  swift?: string;
  account_name: string;
};


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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const staffId = params.id;
    const body: UpdateBankAccountRequest = await req.json();
    const { iban, swift, account_name } = body;

    if (!iban || !account_name) {
      return NextResponse.json(
        { error: 'IBAN e nome da conta são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verificar se o staff pertence ao usuário
    const { data: staff, error: staffError } = await supabase
      .from('event_staff')
      .select('*')
      .eq('id', staffId)
      .eq('user_id', userId)
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        { error: 'Staff não encontrado ou acesso negado' },
        { status: 404 }
      );
    }

    // Criar Stripe Connect account se não existir
    const stripe = getStripe();
    let stripeConnectAccountId = staff.stripe_connect_account_id;

    if (!stripeConnectAccountId && stripe) {
      try {
        // Criar Connect account
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'PT',
          email: staff.email,
          capabilities: {
            transfers: { requested: true },
          },
        });

        stripeConnectAccountId = account.id;

        // Criar account link para onboarding
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/staff/${staffId}/bank-account?refresh=true`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/staff/${staffId}/bank-account?success=true`,
          type: 'account_onboarding',
        });

        // Atualizar staff com account ID
        const { error: updateError } = await supabase
          .from('event_staff')
          .update({
            bank_iban: iban,
            bank_swift: swift,
            bank_account_name: account_name,
            bank_account_setup: true,
            stripe_connect_account_id: stripeConnectAccountId,
          })
          .eq('id', staffId);

        if (updateError) {
          console.error('Erro ao atualizar staff:', updateError);
          return NextResponse.json(
            { error: 'Erro ao atualizar conta bancária' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          onboarding_url: accountLink.url,
          stripe_account_id: stripeConnectAccountId,
        });
      } catch (stripeError: any) {
        console.error('Erro ao criar Stripe Connect account:', stripeError);
        return NextResponse.json(
          { error: 'Erro ao configurar pagamento', details: stripeError.message },
          { status: 500 }
        );
      }
    } else {
      // Apenas atualizar dados bancários
      const { data: updatedStaff, error: updateError } = await supabase
        .from('event_staff')
        .update({
          bank_iban: iban,
          bank_swift: swift,
          bank_account_name: account_name,
          bank_account_setup: true,
        })
        .eq('id', staffId)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar staff:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar conta bancária' },
          { status: 500 }
        );
      }

      return NextResponse.json(updatedStaff, { status: 200 });
    }
  } catch (error) {
    console.error('Erro no endpoint de conta bancária:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
