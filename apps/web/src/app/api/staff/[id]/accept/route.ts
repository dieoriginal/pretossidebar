import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseClient } from 'shared-logic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const staffId = params.id;
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verificar token e obter staff
    const { data: staff, error: staffError } = await supabase
      .from('event_staff')
      .select('*')
      .eq('id', staffId)
      .eq('invitation_token', token)
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        { error: 'Convite inválido ou não encontrado' },
        { status: 404 }
      );
    }

    if (staff.status !== 'invited') {
      return NextResponse.json(
        { error: 'Convite já foi processado' },
        { status: 400 }
      );
    }

    // Aceitar convite
    const { data: updatedStaff, error: updateError } = await supabase
      .from('event_staff')
      .update({
        user_id: userId,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', staffId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao aceitar convite:', updateError);
      return NextResponse.json(
        { error: 'Erro ao aceitar convite' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedStaff, { status: 200 });
  } catch (error) {
    console.error('Erro no endpoint de aceite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
