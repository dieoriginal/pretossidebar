import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseClient } from 'shared-logic';
import { calculateSplit, canProcessSplit } from 'shared-logic';

export async function POST(
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
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('artist_id, status')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    if (event.artist_id !== userId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    if (event.status !== 'completed') {
      return NextResponse.json(
        { error: 'Evento ainda não foi completado' },
        { status: 400 }
      );
    }

    // Obter staff do evento
    const { data: staff, error: staffError } = await supabase
      .from('event_staff')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'accepted');

    if (staffError) {
      return NextResponse.json(
        { error: 'Erro ao buscar staff' },
        { status: 500 }
      );
    }

    // Calcular receita total (vendas de bilhetes)
    const { data: ticketSales, error: salesError } = await supabase
      .from('ticket_sales')
      .select('total_amount')
      .eq('event_id', eventId);

    if (salesError) {
      return NextResponse.json(
        { error: 'Erro ao calcular receita' },
        { status: 500 }
      );
    }

    const totalRevenue = (ticketSales || []).reduce(
      (sum, sale) => sum + (sale.total_amount || 0),
      0
    );

    // Obter custos do evento
    const { data: booking } = await supabase
      .from('bookings')
      .select('final_price')
      .eq('id', event.booking_id || '')
      .single();

    const venueCost = booking?.final_price || 0;

    // Obter custos de serviços
    const { data: serviceBookings, error: servicesError } = await supabase
      .from('service_bookings')
      .select('price')
      .eq('event_id', eventId)
      .eq('payment_status', 'succeeded');

    if (servicesError) {
      return NextResponse.json(
        { error: 'Erro ao calcular custos de serviços' },
        { status: 500 }
      );
    }

    const servicesCost = (serviceBookings || []).reduce(
      (sum, sb) => sum + (sb.price || 0),
      0
    );

    // Taxa da plataforma (8%)
    const platformFeePercentage = 8;

    // Calcular split
    const calculation = calculateSplit({
      totalRevenue,
      platformFeePercentage,
      venueCost,
      servicesCost,
      staff: (staff || []).map((s) => ({
        id: s.id,
        split_type: s.split_type as 'percentage' | 'fixed',
        split_value: Number(s.split_value),
      })),
    });

    // Criar ou atualizar payment_split
    const { data: existingSplit } = await supabase
      .from('payment_splits')
      .select('*')
      .eq('event_id', eventId)
      .single();

    const splitData = {
      event_id: eventId,
      total_revenue: calculation.total_revenue,
      platform_fee: calculation.platform_fee,
      venue_cost: calculation.venue_cost,
      services_cost: calculation.services_cost,
      net_revenue: calculation.net_revenue,
      split_status: 'calculating',
      calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let paymentSplit;
    if (existingSplit) {
      const { data, error } = await supabase
        .from('payment_splits')
        .update(splitData)
        .eq('id', existingSplit.id)
        .select()
        .single();
      
      if (error) throw error;
      paymentSplit = data;
    } else {
      const { data, error } = await supabase
        .from('payment_splits')
        .insert(splitData)
        .select()
        .single();
      
      if (error) throw error;
      paymentSplit = data;
    }

    // Criar split_payouts
    const payouts = calculation.payouts.map((p) => ({
      payment_split_id: paymentSplit.id,
      staff_id: p.staff_id,
      amount: p.amount,
      currency: 'EUR',
      status: 'pending',
    }));

    // Deletar payouts antigos e criar novos
    await supabase
      .from('split_payouts')
      .delete()
      .eq('payment_split_id', paymentSplit.id);

    const { error: payoutsError } = await supabase
      .from('split_payouts')
      .insert(payouts);

    if (payoutsError) {
      console.error('Erro ao criar payouts:', payoutsError);
      return NextResponse.json(
        { error: 'Erro ao criar payouts' },
        { status: 500 }
      );
    }

    // Atualizar status do split
    await supabase
      .from('payment_splits')
      .update({ split_status: 'pending' })
      .eq('id', paymentSplit.id);

    return NextResponse.json({
      split: paymentSplit,
      calculation,
      payouts,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro no cálculo de split:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
