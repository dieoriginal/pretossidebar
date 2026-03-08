import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip password gate for the gate page itself, API auth, and static assets
  if (
    pathname.startsWith("/auth/gate") ||
    pathname.startsWith("/api/auth/gate") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css")
  ) {
    return NextResponse.next();
  }

  const sitePassword = process.env.SITE_PASSWORD;
  const siteSecret = process.env.SITE_SECRET || "default-secret-change-me";

  // If no password is configured, let everyone through
  if (!sitePassword) {
    return NextResponse.next();
  }

  // Check for the access cookie
  const accessCookie = request.cookies.get("site-access")?.value;

  if (!accessCookie) {
    const gateUrl = new URL("/auth/gate", request.url);
    gateUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(gateUrl);
  }

  // Verify the cookie value matches the expected hash
  const encoder = new TextEncoder();
  const data = encoder.encode(sitePassword + siteSecret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const expectedHash = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (accessCookie !== expectedHash) {
    const gateUrl = new URL("/auth/gate", request.url);
    gateUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(gateUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|api/analyze).*)",
  ],
};
