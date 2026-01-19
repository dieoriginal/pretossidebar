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

    const publicEvent = await getPublicEvent(eventId);
    
    if (!publicEvent) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      progress: publicEvent.progress,
      currentStep: publicEvent.currentStep,
      totalSteps: publicEvent.totalSteps,
      updatedAt: publicEvent.updatedAt,
    });
  } catch (error: any) {
    console.error("Erro ao buscar progresso do evento:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar progresso" },
      { status: 500 }
    );
  }
}



