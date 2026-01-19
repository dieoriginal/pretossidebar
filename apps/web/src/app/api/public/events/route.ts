import { NextRequest, NextResponse } from "next/server";
import { getPublicEvents } from "@/lib/public-helpers";
import { optionalAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await optionalAuth(req);
    
    const events = await getPublicEvents();
    
    return NextResponse.json({
      events,
      count: events.length,
    });
  } catch (error: any) {
    console.error("Erro ao buscar eventos públicos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar eventos" },
      { status: 500 }
    );
  }
}



