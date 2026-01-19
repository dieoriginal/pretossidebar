import { NextRequest, NextResponse } from "next/server";
import { getPublicProjects } from "@/lib/public-helpers";
import { optionalAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Autenticação opcional - fãs autenticados podem ver mais detalhes
    const user = await optionalAuth(req);
    
    const projects = await getPublicProjects();
    
    // Se não autenticado, retornar apenas projetos públicos
    // Se autenticado, pode retornar mais informações
    return NextResponse.json({
      projects,
      count: projects.length,
    });
  } catch (error: any) {
    console.error("Erro ao buscar projetos públicos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar projetos" },
      { status: 500 }
    );
  }
}



