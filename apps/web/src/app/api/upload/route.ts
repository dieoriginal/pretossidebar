/**
 * File upload API — uploads binary assets to Cloudflare R2.
 * 
 * POST /api/upload
 *   Body: FormData with fields:
 *     - file: File blob
 *     - projectId: string
 *     - type: "audio" | "image" | "document" (optional, default "audio")
 * 
 * Returns: { storageKey, url }
 * 
 * GET /api/upload?action=presign&key=...&contentType=...
 *   Returns a presigned PUT URL for direct client upload.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadToR2, generateStorageKey, getPresignedUrl, getPresignedUploadUrl } from "@/lib/r2";
import { registerFile } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const fileType = (formData.get("type") as string) || "audio";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "No projectId provided" }, { status: 400 });
    }

    // Generate a unique storage key
    const storageKey = generateStorageKey(
      userId,
      projectId,
      file.name || `recording-${Date.now()}.webm`,
      fileType as "audio" | "image" | "document"
    );

    // Upload to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToR2(storageKey, buffer, file.type || "audio/webm");

    // Register in database
    await registerFile(
      userId,
      projectId,
      storageKey,
      file.name || "recording.webm",
      file.type || "audio/webm",
      buffer.length
    );

    // Generate a presigned URL for immediate playback
    const url = await getPresignedUrl(storageKey);

    return NextResponse.json({
      storageKey,
      url,
      size: buffer.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "presign") {
      const key = searchParams.get("key");
      const contentType = searchParams.get("contentType") || "audio/webm";

      if (!key) {
        return NextResponse.json({ error: "No key provided" }, { status: 400 });
      }

      const uploadUrl = await getPresignedUploadUrl(key, contentType);
      return NextResponse.json({ uploadUrl });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Upload GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
