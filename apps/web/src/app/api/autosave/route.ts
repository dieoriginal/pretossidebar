/**
 * Auto-save API — receives project state and persists to Supabase.
 * Supports both full saves and WAL (Write-Ahead Log) patches.
 * 
 * POST /api/autosave
 *   Body JSON: { projectId, data, metadata?, patch?, snapshot? }
 *   
 *   - If `data` is present: full project save (compressed string)
 *   - If `patch` is present: WAL entry (partial update)
 *   - If `snapshot` is true: also creates a project_version
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  saveProjectServer,
  createProjectVersion,
  appendWalEntry,
  upsertProfile,
} from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      data,
      metadata,
      patch,
      snapshot,
    } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    // Ensure user profile exists (lazy create)
    try {
      await upsertProfile(userId);
    } catch {
      // Profile table might not exist yet — continue
    }

    // WAL patch (lightweight, immediate)
    if (patch && typeof patch === "object") {
      await appendWalEntry(userId, projectId, patch);
      return NextResponse.json({ saved: "wal", ts: new Date().toISOString() });
    }

    // Full project save
    if (data) {
      const deviceInfo = request.headers.get("x-device-info") || undefined;
      await saveProjectServer(userId, projectId, data, {
        ...metadata,
        deviceInfo,
      });

      // Create a snapshot if requested
      if (snapshot) {
        await createProjectVersion(
          userId,
          projectId,
          data,
          metadata?.description || "auto-snapshot"
        );
      }

      return NextResponse.json({
        saved: "full",
        ts: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "No data or patch provided" }, { status: 400 });
  } catch (error) {
    console.error("Autosave error:", error);
    return NextResponse.json(
      { error: "Save failed" },
      { status: 500 }
    );
  }
}
