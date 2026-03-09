import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't need Clerk auth (public routes)
const isPublicRoute = createRouteMatcher([
  "/auth/gate",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/auth/gate",
  "/api/webhooks/clerk",
  "/api/upload(.*)",
  "/api/files(.*)",
]);

// Skip password gate for these paths
function shouldSkipGate(pathname: string): boolean {
  return (
    pathname.startsWith("/auth/gate") ||
    pathname.startsWith("/api/auth/gate") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css")
  );
}

/** Password gate check — runs BEFORE Clerk */
async function passwordGateCheck(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  if (shouldSkipGate(pathname)) return null;

  const sitePassword = process.env.SITE_PASSWORD;
  const siteSecret = process.env.SITE_SECRET || "default-secret-change-me";

  // If no password is configured, skip gate
  if (!sitePassword) return null;

  const accessCookie = request.cookies.get("site-access")?.value;

  if (!accessCookie) {
    const gateUrl = new URL("/auth/gate", request.url);
    gateUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(gateUrl);
  }

  // Verify the cookie hash
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

  return null; // gate passed
}

export default clerkMiddleware(async (auth, request) => {
  // 1. Password gate first
  const gateRedirect = await passwordGateCheck(request);
  if (gateRedirect) return gateRedirect;

  // 2. Clerk auth — protect non-public routes
  if (!isPublicRoute(request)) {
    // auth().protect() will redirect to sign-in if not authenticated
    // But we want unauthenticated users to still access the app for now
    // (projects will be local-only until they sign in)
    // So we don't enforce auth here — just let Clerk attach userId if available
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and _next
    "/((?!_next|.*\\..*|api/analyze).*)",
  ],
};
