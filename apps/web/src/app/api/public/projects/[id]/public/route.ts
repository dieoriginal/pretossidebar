import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { loadProjectFromIndexedDB, saveProjectToIndexedDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Apenas admins podem marcar projetos como públicos/privados
  const authResult = await requireAuth(req, ["admin"]);
  
  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const projectId = params.id;
    const body = await req.json();
    const { isPublic } = body;

    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic deve ser um booleano" },
        { status: 400 }
      );
    }

    const projectData = await loadProjectFromIndexedDB(projectId);
    
    if (!projectData) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    const data = projectData.data || projectData;
    data.isPublic = isPublic;
    data.updatedAt = new Date().toISOString();

    await saveProjectToIndexedDB(data);

    // Sincronizar com Supabase para persistência na nuvem
    try {
      const { syncProjectToPublic } = await import("@/lib/database-sync");
      await syncProjectToPublic(projectId, data);
    } catch (syncError) {
      console.error("Erro ao sincronizar com Supabase:", syncError);
      // Continuar mesmo se a sincronização falhar
    }

    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
        isPublic,
      },
    });
  } catch (error: any) {
    console.error("Erro ao atualizar visibilidade do projeto:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar projeto" },
      { status: 500 }
    );
  }
}



