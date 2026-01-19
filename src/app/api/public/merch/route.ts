import { NextRequest, NextResponse } from "next/server";
import { optionalAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// TODO: Implementar sistema de merch quando estiver pronto
export async function GET(req: NextRequest) {
  try {
    const user = await optionalAuth(req);
    
    // Por enquanto, retornar array vazio
    // Em produção, buscar produtos de merch do banco de dados
    return NextResponse.json({
      products: [],
      count: 0,
    });
  } catch (error: any) {
    console.error("Erro ao buscar merch:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}



