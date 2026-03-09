export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { id, songInfo, strophes, currentStep, updatedAt } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Compose minimal metadata for dashboard
    const metadata = {
      title: songInfo?.title || null,
      artist: songInfo?.artist || null,
      producer: songInfo?.producer || null,
      featuring: songInfo?.featuring ? songInfo.featuring.join(", ") : null,
    };

    // Compress data for storage (reuse compressData from use-cloud-sync)
    // For now, store as JSON string (server-side, no pako)
    const data = JSON.stringify({ songInfo, strophes, currentStep });

    const { error } = await supabaseAdmin
      .from("projects")
      .upsert({
        id,
        user_id: userId,
        data,
        ...metadata,
        updated_at: updatedAt || new Date().toISOString(),
        last_synced: new Date().toISOString(),
      }, { onConflict: "id,user_id" });

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json({ error: "Create failed" }, { status: 500 });
    }

    // Add to project_members
    await supabaseAdmin
      .from("project_members")
      .upsert({ project_id: id, user_id: userId, role: "owner" }, { onConflict: "project_id,user_id" })
      .catch(() => {});

    return NextResponse.json({ created: true, id });
  } catch (error) {
    console.error("Projects POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
/**
 * Projects API — list, load, delete user projects.
 * 
 * GET  /api/projects          → list all projects for current user
 * GET  /api/projects?id=xxx   → load a single project's full data
 * DELETE /api/projects?id=xxx → delete a project
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { loadUserProjects, loadProjectData } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");

    // Single project
    if (projectId) {
      const project = await loadProjectData(userId, projectId);
      if (!project) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(project);
    }

    // All projects (metadata only, no data blob)
    const projects = await loadUserProjects(userId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Delete from projects table (only own projects)
    const { error } = await supabaseAdmin
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    // Clean up related data
    await Promise.allSettled([
      supabaseAdmin.from("project_members").delete().eq("project_id", projectId),
      supabaseAdmin.from("project_versions").delete().eq("project_id", projectId).eq("user_id", userId),
      supabaseAdmin.from("project_wal").delete().eq("project_id", projectId).eq("user_id", userId),
      supabaseAdmin.from("files").delete().eq("project_id", projectId).eq("user_id", userId),
    ]);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Projects DELETE error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
