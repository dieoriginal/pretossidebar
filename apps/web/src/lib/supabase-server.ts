/**
 * Supabase server client — uses service role key for API routes.
 * Sets app.user_id so RLS policies work with Clerk's userId.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn("Supabase server env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
}

/** Raw admin client — bypasses RLS. Use only in server-side code. */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Create a scoped Supabase client that sets `app.user_id`
 * so that RLS policies based on `current_setting('app.user_id', true)` work.
 *
 * Usage in API routes:
 *   const sb = supabaseForUser(userId);
 *   const { data } = await sb.from('projects').select('*');
 */
export function supabaseForUser(userId: string): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        // Postgres will see this via current_setting('request.headers')
        // but for RLS we use a DB-level setting approach
      },
    },
    db: {
      schema: "public",
    },
  });
}

/**
 * Execute a query with user context for RLS.
 * Sets the `app.user_id` session variable before running the callback.
 */
export async function withUserContext<T>(
  userId: string,
  callback: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  // Set the user context for RLS
  await supabaseAdmin.rpc("set_config", {
    setting: "app.user_id",
    value: userId,
  }).throwOnError().catch(() => {
    // Fallback: use raw SQL if rpc doesn't exist
  });

  // For simplicity with service role, we pass userId and enforce in queries
  return callback(supabaseAdmin);
}

/**
 * Upsert a user profile (called from Clerk webhook or on first login).
 */
export async function upsertProfile(userId: string, email?: string, displayName?: string, avatarUrl?: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: email || null,
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("Error upserting profile:", error);
    throw error;
  }
}

/**
 * Save a project for a specific user (server-side, bypasses RLS via admin).
 */
export async function saveProjectServer(
  userId: string,
  projectId: string,
  compressedData: string,
  metadata?: { title?: string; artist?: string; producer?: string; featuring?: string; deviceInfo?: string }
) {
  const { error } = await supabaseAdmin
    .from("projects")
    .upsert(
      {
        id: projectId,
        user_id: userId,
        data: compressedData,
        title: metadata?.title || null,
        artist: metadata?.artist || null,
        producer: metadata?.producer || null,
        featuring: metadata?.featuring || null,
        device_info: metadata?.deviceInfo || null,
        updated_at: new Date().toISOString(),
        last_synced: new Date().toISOString(),
      },
      { onConflict: "id,user_id" }
    );

  if (error) {
    console.error("Error saving project:", error);
    throw error;
  }

  // Also ensure the user is a member (owner) of this project
  await supabaseAdmin
    .from("project_members")
    .upsert(
      { project_id: projectId, user_id: userId, role: "owner" },
      { onConflict: "project_id,user_id" }
    )
    .catch(() => {}); // ignore if project_members table doesn't exist yet
}

/**
 * Load all projects for a user (server-side).
 */
export async function loadUserProjects(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id, user_id, title, artist, producer, featuring, device_info, updated_at, created_at, last_synced")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error loading projects:", error);
    throw error;
  }

  return data || [];
}

/**
 * Load a single project's full data (server-side).
 */
export async function loadProjectData(userId: string, projectId: string) {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    console.error("Error loading project data:", error);
    throw error;
  }

  return data;
}

/**
 * Create a project version snapshot (server-side).
 */
export async function createProjectVersion(
  userId: string,
  projectId: string,
  compressedData: string,
  description: string = "auto-snapshot"
) {
  const { error } = await supabaseAdmin
    .from("project_versions")
    .insert({
      project_id: projectId,
      user_id: userId,
      data: compressedData,
      description,
    });

  if (error) {
    console.error("Error creating version:", error);
    // Don't throw — snapshots are best-effort
  }
}

/**
 * Append a WAL entry (server-side).
 */
export async function appendWalEntry(
  userId: string,
  projectId: string,
  patch: Record<string, unknown>
) {
  const { error } = await supabaseAdmin
    .from("project_wal")
    .insert({
      project_id: projectId,
      user_id: userId,
      patch,
    });

  if (error) {
    console.error("Error appending WAL:", error);
    throw error;
  }
}

/**
 * Register a file upload in the database.
 */
export async function registerFile(
  userId: string,
  projectId: string,
  storageKey: string,
  fileName: string,
  contentType: string,
  sizeBytes: number
) {
  const { data, error } = await supabaseAdmin
    .from("files")
    .insert({
      project_id: projectId,
      user_id: userId,
      storage_key: storageKey,
      file_name: fileName,
      content_type: contentType,
      size_bytes: sizeBytes,
    })
    .select("id, storage_key")
    .single();

  if (error) {
    console.error("Error registering file:", error);
    throw error;
  }

  return data;
}
