import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Webhook para receber confirmações de pagamento do If Then Pay
 * Este endpoint deve ser chamado pelo If Then Pay quando um pagamento é confirmado
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar assinatura do webhook (importante para segurança)
    const signature = req.headers.get("x-if-then-pay-signature");
    const rawBody = await req.text();
    
    if (signature) {
      const { getIfThenPayClient } = await import("@/lib/payment/if-then-pay");
      const paymentClient = getIfThenPayClient();
      
      if (!paymentClient.verifyWebhookSignature(rawBody, signature)) {
        return NextResponse.json(
          { error: "Assinatura inválida" },
          { status: 401 }
        );
      }
    }
    
    const body = JSON.parse(rawBody);
    const { paymentId, featId, status, amount, currency } = body;

    if (!paymentId || !featId) {
      return NextResponse.json(
        { error: "paymentId e featId são obrigatórios" },
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

    // Verificar se o valor corresponde
    if (featData.amount !== amount || featData.currency !== currency) {
      return NextResponse.json(
        { error: "Valor ou moeda não correspondem" },
        { status: 400 }
      );
    }

    // Atualizar status do pedido baseado no status do pagamento
    let newStatus = "pending";
    if (status === "paid" || status === "completed") {
      newStatus = "paid";
    } else if (status === "failed" || status === "cancelled") {
      newStatus = "cancelled";
    } else if (status === "processing") {
      newStatus = "processing";
    }

    await updateDoc(featRef, {
      status: newStatus,
      paymentId,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}



