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

    const publicProject = await getPublicProject(projectId);
    
    if (!publicProject) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      progress: publicProject.progress,
      currentStep: publicProject.currentStep,
      totalSteps: publicProject.totalSteps,
      updatedAt: publicProject.updatedAt,
    });
  } catch (error: any) {
    console.error("Erro ao buscar progresso:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar progresso" },
      { status: 500 }
    );
  }
}



