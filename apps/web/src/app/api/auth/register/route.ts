import { NextResponse } from "next/server";

// Legacy route — authentication is handled by Clerk
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been deprecated. Authentication is handled by Clerk." },
    { status: 410 }
  );
}
