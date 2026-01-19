import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Nota: Em produção, use Firebase Admin SDK para criar usuários
    // Por enquanto, retornamos sucesso e o cliente criará o usuário via Firebase Auth
    // O registro real será feito no cliente usando Firebase Auth
    
    // Criar documento do usuário no Firestore
    const userRef = doc(collection(db, "fan_users"), email);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return NextResponse.json(
        { error: "Usuário já existe" },
        { status: 409 }
      );
    }

    await setDoc(userRef, {
      email,
      name: name || "",
      role: "fan",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Usuário registrado com sucesso. Por favor, faça login.",
    });
  } catch (error: any) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao registrar usuário" },
      { status: 500 }
    );
  }
}



