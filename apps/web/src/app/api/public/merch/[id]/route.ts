import { NextRequest, NextResponse } from "next/server";
import { optionalAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// TODO: Implementar sistema de merch quando estiver pronto
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await optionalAuth(req);
    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório" },
        { status: 400 }
      );
    }

    // Por enquanto, retornar erro 404
    return NextResponse.json(
      { error: "Produto não encontrado" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Erro ao buscar produto:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}



