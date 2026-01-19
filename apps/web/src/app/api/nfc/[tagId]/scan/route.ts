import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { optionalAuth } from "@/lib/api-auth";
import { NFCScan } from "@/types/public";

export async function POST(
  req: NextRequest,
  { params }: { params: { tagId: string } }
) {
  try {
    const tagId = params.tagId;
    const user = await optionalAuth(req);

    if (!tagId) {
      return NextResponse.json(
        { error: "Tag ID é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se tag existe e está ativa
    const tagRef = doc(db, "nfc_tags", tagId);
    const tagDoc = await getDoc(tagRef);

    if (!tagDoc.exists()) {
      return NextResponse.json(
        { error: "Tag não encontrada" },
        { status: 404 }
      );
    }

    const tagData = tagDoc.data();

    if (!tagData.isActive) {
      return NextResponse.json(
        { error: "Tag inativa" },
        { status: 403 }
      );
    }

    // Incrementar contador de scans
    await updateDoc(tagRef, {
      scanCount: (tagData.scanCount || 0) + 1,
      updatedAt: serverTimestamp(),
    });

    // Registrar scan no log
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const scanData: Omit<NFCScan, "id"> = {
      tagId,
      userId: user?.uid,
      userAgent,
      ipAddress: clientIp,
      scannedAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "nfc_scans"), {
      ...scanData,
      scannedAt: serverTimestamp(),
    });

    // Retornar informações da tag para redirecionamento
    return NextResponse.json({
      success: true,
      tag: {
        id: tagId,
        title: tagData.title,
        artist: tagData.artist,
        redirectUrl: tagData.redirectUrl,
        contentUrl: tagData.contentUrl,
      },
    });
  } catch (error: any) {
    console.error("Erro ao registrar scan:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao registrar scan" },
      { status: 500 }
    );
  }
}



