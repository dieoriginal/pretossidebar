import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  
  if ("error" in authResult) {
    return authResult.error;
  }

  return NextResponse.json({
    user: authResult.user,
  });
}



