/**
 * File serving API — returns presigned URLs for R2 objects.
 * 
 * GET /api/files/[key] → redirects to presigned R2 URL
 */

import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string[] } }
) {
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
