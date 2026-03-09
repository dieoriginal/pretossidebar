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
 * NOTE: R2 is currently disabled (env vars not configured).
 * Returns 503 so clients fall back to base64 local storage.
 */

import { NextRequest, NextResponse } from "next/server";

const R2_CONFIGURED =
  !!(process.env.R2_ACCOUNT_ID &&
     process.env.R2_ACCESS_KEY_ID &&
     process.env.R2_SECRET_ACCESS_KEY &&
     process.env.R2_BUCKET_NAME);

export async function POST(_request: NextRequest) {
  if (!R2_CONFIGURED) {
    return NextResponse.json(
      { error: "R2 storage not configured — use base64 fallback", r2Disabled: true },
      { status: 503 }
    );
  }

  // Dynamic import so the module is only loaded when R2 is configured
  const { auth } = await import("@clerk/nextjs/server");
  const { uploadToR2, generateStorageKey, getPresignedUrl } = await import("@/lib/r2");
  const { registerFile } = await import("@/lib/supabase-server");

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await _request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const fileType = (formData.get("type") as string) || "audio";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "No projectId provided" }, { status: 400 });
    }

    const storageKey = generateStorageKey(
      userId,
      projectId,
      file.name || `recording-${Date.now()}.webm`,
      fileType as "audio" | "image" | "document"
    );

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToR2(storageKey, buffer, file.type || "audio/webm");

    await registerFile(
      userId,
      projectId,
      storageKey,
      file.name || "recording.webm",
      file.type || "audio/webm",
      buffer.length
    );

    const url = await getPresignedUrl(storageKey);

    return NextResponse.json({ storageKey, url, size: buffer.length });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!R2_CONFIGURED) {
    return NextResponse.json(
      { error: "R2 storage not configured", r2Disabled: true },
      { status: 503 }
    );
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { getPresignedUploadUrl } = await import("@/lib/r2");

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

