import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rotas públicas (não requerem autenticação)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/help',
  '/privacy',
  '/terms',
  '/gdpr',
  '/subscription/success',
  '/subscription/cancel',
  '/api/subscriptions/webhook',
]);

export default clerkMiddleware(async (auth, req) => {
  // Permitir acesso a rotas públicas
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Para rotas protegidas, verificar autenticação
  const { userId } = await auth();
  
  if (!userId) {
    // Redirecionar para sign-in se não autenticado
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

// Protect everything except Next internals, static assets, and public routes
export const config = {
  matcher: [
    "/((?!_next|.*\\..*|api/analyze|api/subscriptions/webhook).*)",
  ],
};
