import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with service role key for admin operations
const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export type UserRole = "admin" | "fan";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
}

/**
 * Verifica token de autenticação usando Supabase
 */
export async function verifyAuthToken(token: string): Promise<AuthenticatedUser | null> {
  try {
    if (!supabaseAdmin) {
      console.warn("Supabase not configured");
      return null;
    }

    // Verificar token JWT do Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.error("Error verifying token:", error);
      return null;
    }

    // Buscar role do usuário na tabela de perfis (se existir)
    let role: UserRole = "fan";
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile?.role) {
        role = profile.role as UserRole;
      }
    } catch (err) {
      // Se a tabela profiles não existir, usar role padrão
      console.warn("Profiles table not found, using default role");
    }
    
    return {
      uid: user.id,
      email: user.email || "",
      role,
      name: user.user_metadata?.name || user.user_metadata?.full_name,
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

/**
 * Extrai token do header Authorization
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware para rotas protegidas
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ user: AuthenticatedUser } | { error: NextResponse }> {
  const token = extractToken(request);
  
  if (!token) {
    return {
      error: NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 }),
    };
  }

  const user = await verifyAuthToken(token);
  
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 }),
    };
  }

  return { user };
}

/**
 * Middleware para rotas que podem ser acessadas por usuários autenticados ou anônimos
 */
export async function optionalAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  const token = extractToken(request);
  if (!token) return null;
  return await verifyAuthToken(token);
}
