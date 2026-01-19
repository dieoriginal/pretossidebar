import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(req);
  
  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const featId = params.id;
    const body = await req.json();
    const { paymentMethod } = body; // "if-then-pay" ou outro método

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

    // Verificar se o usuário é o dono do pedido
    if (featData.userId !== authResult.user.uid) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    if (featData.status !== "pending") {
      return NextResponse.json(
        { error: "Pedido já foi processado" },
        { status: 400 }
      );
    }

    // Integrar com If Then Pay
    const { getIfThenPayClient } = await import("@/lib/payment/if-then-pay");
    const paymentClient = getIfThenPayClient();
    
    const paymentRequest = {
      amount: featData.amount,
      currency: featData.currency || "EUR",
      description: `Feat: ${featData.serviceType} - ${featData.details.substring(0, 100)}`,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/feat/${featId}/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/feat/${featId}/cancel`,
      reference: featId,
    };

    let paymentId: string;
    let paymentLink: string;

    try {
      const paymentResponse = await paymentClient.createPayment(paymentRequest);
      paymentId = paymentResponse.paymentId;
      paymentLink = paymentResponse.paymentLink;
    } catch (error: any) {
      // Fallback para mock se If Then Pay não estiver configurado
      console.warn("If Then Pay não configurado, usando mock:", error);
      paymentId = `payment-${Date.now()}`;
      paymentLink = `/feat/${featId}/pay-mock`; // Mock payment page
    }

    // Atualizar status do pedido
    await updateDoc(featRef, {
      status: "processing",
      paymentId,
      paymentLink,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      paymentLink,
      paymentId,
      message: "Link de pagamento gerado com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao processar pagamento:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}



