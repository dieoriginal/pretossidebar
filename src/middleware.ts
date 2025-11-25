import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// Protect everything except Next internals, static assets, and the Flask proxy
export const config = {
  matcher: [
    "/((?!_next|.*\\..*|api/analyze|sign-in|sign-up).*)",
  ],
};
