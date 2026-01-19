import { NextRequest, NextResponse } from "next/server";
import { getPublicEvent } from "@/lib/public-helpers";
import { optionalAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await optionalAuth(req);
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json(
        { error: "ID do evento é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar do Supabase
    const publicEvent = await getPublicEvent(eventId);
    
    if (!publicEvent) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      event: publicEvent,
    });
  } catch (error: any) {
    console.error("Erro ao buscar evento:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar evento" },
      { status: 500 }
    );
  }
}



