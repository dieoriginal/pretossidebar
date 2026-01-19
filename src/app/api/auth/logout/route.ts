import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // O logout é principalmente feito no cliente (Firebase Auth)
  // Este endpoint apenas confirma o logout
  return NextResponse.json({
    success: true,
    message: "Logout realizado com sucesso",
  });
}



