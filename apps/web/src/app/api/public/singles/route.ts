import { NextRequest, NextResponse } from "next/server";
import { fetchPublicSingles } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const singles = await fetchPublicSingles();
    return NextResponse.json({ singles });
  } catch (error: any) {
    console.error("Erro ao buscar singles públicos:", error);
    return NextResponse.json({ singles: [] });
  }
}
