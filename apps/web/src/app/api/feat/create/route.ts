import { NextResponse } from "next/server";

// Legacy route — feat system has been deprecated
export async function GET() {
  return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}
export async function PATCH() {
  return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}
export async function DELETE() {
  return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}
