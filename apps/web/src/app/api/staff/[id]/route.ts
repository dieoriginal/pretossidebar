import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from 'shared-logic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Buscar staff por token
    const { data: staff, error: staffError } = await supabase
      .from('event_staff')
      .select('*')
      .eq('id', params.id)
      .eq('invitation_token', token)
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        { error: 'Convite não encontrado ou inválido' },
        { status: 404 }
      );
    }

    return NextResponse.json(staff, { status: 200 });
  } catch (error) {
    console.error('Erro no endpoint de staff:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
