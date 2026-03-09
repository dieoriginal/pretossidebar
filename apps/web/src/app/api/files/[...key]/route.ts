/**
 * File serving API — returns presigned URLs for R2 objects.
 * 
 * GET /api/files/[key] → redirects to presigned R2 URL
 */

import { NextRequest, NextResponse } from "next/server";

const R2_CONFIGURED = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string[] } }
) {
  if (!R2_CONFIGURED) {
    return NextResponse.json({ error: "R2 storage not configured", r2Disabled: true }, { status: 503 });
  }

  const { getPresignedUrl } = await import("@/lib/r2");

  try {
    const key = params.key.join("/");

    if (!key) {
      return NextResponse.json({ error: "No key" }, { status: 400 });
    }

    const url = await getPresignedUrl(key, 3600); // 1 hour
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
