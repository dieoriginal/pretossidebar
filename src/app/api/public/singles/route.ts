import { NextRequest, NextResponse } from "next/server";

// Minimal cookie-backed snapshot to simulate persistence for feats/producer/cover
// Note: Cookies are size-limited. For a real backend, wire Supabase/Firebase.

const COOKIE_KEY = "publicSinglesSnapshot";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_KEY)?.value ?? "";
  try {
    const data = cookie ? JSON.parse(cookie) : [];
    return NextResponse.json({ singles: data });
  } catch {
    return NextResponse.json({ singles: [] });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.singles)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_KEY, JSON.stringify(body.singles), { path: "/", httpOnly: false });
  return res;
}
