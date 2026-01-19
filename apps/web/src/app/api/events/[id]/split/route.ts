import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseClient } from 'shared-logic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const eventId = params.id;
    const supabase = getSupabaseClient();

    // Verificar se o usuário é o dono do evento
    const { data: event } = await supabase
      .from('events')
      .select('artist_id')
      .eq('id', eventId)
      .single();

    if (!event || event.artist_id !== userId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Buscar split
    const { data: split, error: splitError } = await supabase
      .from('payment_splits')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (splitError && splitError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Erro ao buscar split' },
        { status: 500 }
      );
    }

    // Buscar payouts se existir split
    let payouts = [];
    if (split) {
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('split_payouts')
        .select(`
          *,
          event_staff (
            id,
            name,
            role,
            split_type,
            split_value
          )
        `)
        .eq('payment_split_id', split.id)
        .order('created_at', { ascending: false });

      if (!payoutsError) {
        payouts = payoutsData || [];
      }
    }

    return NextResponse.json({
      split: split || null,
      payouts,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro no endpoint de split:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
