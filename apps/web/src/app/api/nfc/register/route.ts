import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { NFCTag } from "@/types/public";

export async function POST(req: NextRequest) {
  // Apenas admins podem registrar tags NFC
  const authResult = await requireAuth(req, ["admin"]);
  
  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const body = await req.json();
    const { tagId, title, artist, album, redirectUrl, contentUrl, metadata } = body;

    if (!tagId || !title || !artist || !redirectUrl) {
      return NextResponse.json(
        { error: "tagId, title, artist e redirectUrl são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se tag já existe
    const existingTagRef = doc(db, "nfc_tags", tagId);
    const existingTag = await getDoc(existingTagRef);
    
    if (existingTag.exists()) {
      return NextResponse.json(
        { error: "Tag ID já existe" },
        { status: 409 }
      );
    }

    const nfcTag: NFCTag = {
      id: tagId,
      tagId,
      title,
      artist,
      album,
      redirectUrl,
      contentUrl,
      metadata: metadata || {},
      isActive: true,
      scanCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Salvar no Firestore
    await setDoc(existingTagRef, {
      ...nfcTag,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      tag: nfcTag,
    });
  } catch (error: any) {
    console.error("Erro ao registrar tag NFC:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao registrar tag" },
      { status: 500 }
    );
  }
}



