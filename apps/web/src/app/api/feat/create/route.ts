import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { FeatRequest } from "@/types/public";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  
  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const body = await req.json();
    const { serviceType, details, amount, currency = "EUR" } = body;

    if (!serviceType || !details || !amount) {
      return NextResponse.json(
        { error: "serviceType, details e amount são obrigatórios" },
        { status: 400 }
      );
    }

    if (!["featuring", "production", "audiovisual"].includes(serviceType)) {
      return NextResponse.json(
        { error: "Tipo de serviço inválido" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser um número positivo" },
        { status: 400 }
      );
    }

    const featId = `feat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const featRequest: FeatRequest = {
      id: featId,
      userId: authResult.user.uid,
      userName: authResult.user.name || authResult.user.email,
      userEmail: authResult.user.email,
      serviceType,
      details,
      amount,
      currency,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Salvar no Firestore
    const featRef = doc(collection(db, "feat_requests"), featId);
    await setDoc(featRef, {
      ...featRequest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // TODO: Criar link de pagamento com If Then Pay
    // Por enquanto, retornar o pedido criado
    const paymentLink = `/feat/${featId}/pay`; // Link temporário

    return NextResponse.json({
      success: true,
      feat: {
        ...featRequest,
        paymentLink,
      },
    });
  } catch (error: any) {
    console.error("Erro ao criar pedido de feat:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}



