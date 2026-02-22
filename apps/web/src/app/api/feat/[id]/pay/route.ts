import { NextResponse } from "next/server";

// Legacy route — feat system has been deprecated
export async function POST() {
  return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}
