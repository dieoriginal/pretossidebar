import { NextRequest, NextResponse } from "next/server";
import { getPublicProject } from "@/lib/public-helpers";
import { optionalAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await optionalAuth(req);
    const projectId = params.id;

    if (!projectId) {
      return NextResponse.json(
        { error: "ID do projeto é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar do Supabase
    const publicProject = await getPublicProject(projectId);
    
    if (!publicProject) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      project: publicProject,
    });
  } catch (error: any) {
    console.error("Erro ao buscar projeto:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar projeto" },
      { status: 500 }
    );
  }
}



