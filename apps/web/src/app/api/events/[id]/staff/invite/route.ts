import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseClient } from 'shared-logic';
import { CreateStaffInviteRequest } from 'shared-logic';
import { randomBytes } from 'crypto';

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
    const body: CreateStaffInviteRequest = await req.json();
    const { email, name, role, split_type, split_value } = body;

    if (!email || !name || !role || !split_type || !split_value) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é o dono do evento
    const supabase = getSupabaseClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('artist_id')
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

    // Gerar token único
    const invitationToken = randomBytes(32).toString('hex');

    // Criar convite de staff
    const { data: staff, error: staffError } = await supabase
      .from('event_staff')
      .insert({
        event_id: eventId,
        email,
        name,
        role,
        split_type,
        split_value,
        invitation_token: invitationToken,
        status: 'invited',
      })
      .select()
      .single();

    if (staffError) {
      console.error('Erro ao criar convite:', staffError);
      return NextResponse.json(
        { error: 'Erro ao criar convite', details: staffError.message },
        { status: 500 }
      );
    }

    // TODO: Enviar email com link de convite
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${eventId}/staff/accept?token=${invitationToken}`;

    return NextResponse.json({
      ...staff,
      invite_link: inviteLink,
    }, { status: 201 });
  } catch (error) {
    console.error('Erro no endpoint de convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
