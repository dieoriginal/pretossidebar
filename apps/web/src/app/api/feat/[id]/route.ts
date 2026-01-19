import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(req);
  
  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const featId = params.id;

    if (!featId) {
      return NextResponse.json(
        { error: "ID do pedido é obrigatório" },
        { status: 400 }
      );
    }

    const featRef = doc(db, "feat_requests", featId);
    const featDoc = await getDoc(featRef);

    if (!featDoc.exists()) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    const featData = featDoc.data();

    // Verificar se o usuário é o dono do pedido ou admin
    if (featData.userId !== authResult.user.uid && authResult.user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      feat: {
        id: featId,
        ...featData,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar pedido:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar pedido" },
      { status: 500 }
    );
  }
}



