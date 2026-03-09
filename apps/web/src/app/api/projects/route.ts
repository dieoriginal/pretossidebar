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
