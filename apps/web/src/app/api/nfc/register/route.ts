import { NextResponse } from "next/server";

// Legacy route — NFC system not active
export async function POST() {
  return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}
