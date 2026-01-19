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

    // Verificar se o usuário tem acesso ao evento
    const { data: event } = await supabase
      .from('events')
      .select('artist_id')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Buscar staff do evento
    const { data: staff, error: staffError } = await supabase
      .from('event_staff')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (staffError) {
      console.error('Erro ao buscar staff:', staffError);
      return NextResponse.json(
        { error: 'Erro ao buscar staff' },
        { status: 500 }
      );
    }

    return NextResponse.json(staff || [], { status: 200 });
  } catch (error) {
    console.error('Erro no endpoint de staff:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
