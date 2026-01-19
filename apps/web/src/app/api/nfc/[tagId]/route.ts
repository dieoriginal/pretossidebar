import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function GET(
  req: NextRequest,
  { params }: { params: { tagId: string } }
) {
  try {
    const tagId = params.tagId;

    if (!tagId) {
      return NextResponse.json(
        { error: "Tag ID é obrigatório" },
        { status: 400 }
      );
    }

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

    // Retornar informações da tag (sem dados sensíveis)
    return NextResponse.json({
      tag: {
        id: tagId,
        title: tagData.title,
        artist: tagData.artist,
        album: tagData.album,
        redirectUrl: tagData.redirectUrl,
        contentUrl: tagData.contentUrl,
        metadata: tagData.metadata,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar tag:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar tag" },
      { status: 500 }
    );
  }
}



