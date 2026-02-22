import { NextResponse } from "next/server";

// Legacy route — NFC system not active
export async function GET() {
  return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}
export async function PUT() {
  return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}
