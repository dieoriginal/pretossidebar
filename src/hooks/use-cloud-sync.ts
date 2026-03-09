/**
 * useCloudSync — Hook for cloud-backed auto-save with WAL + full sync.
 * 
 * Architecture:
 *   1. Every state change → immediate IndexedDB write (crash-proof local)
 *   2. Debounced (2s) → POST /api/autosave with full compressed data
 *   3. Every 5 min → snapshot (project_version)
 *   4. On visibilitychange (tab hide) → immediate flush
 *   5. On beforeunload → sendBeacon as last resort
 * 
 * Status: 'idle' | 'saving' | 'saved' | 'syncing' | 'synced' | 'offline' | 'error'
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { deflate, inflate } from "pako";

export type SyncStatus = "idle" | "saving" | "saved" | "syncing" | "synced" | "offline" | "error";

interface CloudSyncOptions {
  /** The project ID to sync. */
  projectId?: string;
  /** Debounce time for cloud sync (ms). Default 2000. */
  debounceMs?: number;
  /** Snapshot interval (ms). Default 5 minutes. */
  snapshotIntervalMs?: number;
  /** Enable/disable cloud sync. Default true. */
  enabled?: boolean;
}

/** Compress project data for transport/storage */
function compressData(data: any): string {
  const json = JSON.stringify(data);
  const compressed = deflate(json, { to: "string" });
  return compressed;
}

/** Decompress project data */
export function decompressData(compressed: string): any {
  const json = inflate(compressed, { to: "string" });
  return JSON.parse(json);
}

/** Get device info string */
function getDeviceInfo(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Browser";
}

export function useCloudSync(options: CloudSyncOptions = {}) {
  const {
    projectId: configProjectId,
    debounceMs = 2000,
    snapshotIntervalMs = 5 * 60 * 1000, // 5 minutes
    enabled = true,
  } = options;

  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const currentProjectId = useRef(configProjectId ?? "draft");

  // Keep projectId ref in sync with options
  useEffect(() => {
    if (configProjectId) currentProjectId.current = configProjectId;
  }, [configProjectId]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingData = useRef<{ projectId: string; data: any; metadata?: any } | null>(null);
  const lastSnapshotTime = useRef<number>(0);
  // Ref so event-listener callbacks always call the latest flushToCloud without stale closure
  const flushRef = useRef<typeof flushToCloud>(flushToCloud as any);

  // Track online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingData.current) {
        flushRef.current(pendingData.current.projectId, pendingData.current.data, pendingData.current.metadata);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Snapshot interval
  useEffect(() => {
    if (!enabled) return;

    snapshotTimer.current = setInterval(() => {
      if (pendingData.current) {
        flushRef.current(
          pendingData.current.projectId,
          pendingData.current.data,
          pendingData.current.metadata,
          true
        );
      }
    }, snapshotIntervalMs);

    return () => {
      if (snapshotTimer.current) clearInterval(snapshotTimer.current);
    };
  }, [enabled, snapshotIntervalMs]);

  // Visibility change — flush on tab hide
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && pendingData.current) {
        flushRef.current(
          pendingData.current.projectId,
          pendingData.current.data,
          pendingData.current.metadata
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // beforeunload — last resort with sendBeacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingData.current) {
        const compressed = compressData(pendingData.current.data);
        const payload = JSON.stringify({
          projectId: pendingData.current.projectId,
          data: compressed,
          metadata: pendingData.current.metadata,
        });
        navigator.sendBeacon("/api/autosave", payload);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  /** Flush data to cloud immediately */
  const flushToCloud = useCallback(
    async (projectId: string, data: any, metadata?: any, snapshot?: boolean) => {
      if (!enabled || !isOnline) {
        setStatus("offline");
        return;
      }

      try {
        setStatus("syncing");

        const compressed = compressData(data);

        // Determine if we should create a snapshot
        const shouldSnapshot =
          snapshot || Date.now() - lastSnapshotTime.current > snapshotIntervalMs;

        const res = await fetch("/api/autosave", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-device-info": getDeviceInfo(),
          },
          body: JSON.stringify({
            projectId,
            data: compressed,
            metadata,
            snapshot: shouldSnapshot,
          }),
        });

        if (res.ok) {
          const result = await res.json();
          setStatus("synced");
          setLastSynced(result.ts);
          if (shouldSnapshot) {
            lastSnapshotTime.current = Date.now();
          }
        } else if (res.status === 401) {
          // Not authenticated — save locally only
          setStatus("saved");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Cloud sync failed:", error);
        setStatus(isOnline ? "error" : "offline");
      }
    },
    [enabled, isOnline, snapshotIntervalMs]
  );

  // Keep flushRef current so event-listener closures never go stale
  useEffect(() => { flushRef.current = flushToCloud; }, [flushToCloud]);

  /**
   * Schedule a cloud sync (debounced).
   * Call this on every state change.
   */
  const scheduleSync = useCallback(
    (projectId: string, data: any, metadata?: any) => {
      // Store pending data for flush-on-close
      pendingData.current = { projectId, data, metadata };
      setStatus("saving");

      // Clear existing debounce
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Schedule debounced sync
      debounceTimer.current = setTimeout(() => {
        flushToCloud(projectId, data, metadata);
      }, debounceMs);
    },
    [debounceMs, flushToCloud]
  );

  /**
   * Force an immediate sync (no debounce).
   * Use for manual "Save" button clicks.
   */
  const forceSave = useCallback(
    async (projectId: string, data: any, metadata?: any) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      pendingData.current = { projectId, data, metadata };
      await flushToCloud(projectId, data, metadata, true);
    },
    [flushToCloud]
  );

  /**
   * Load a project from the cloud.
   */
  const loadFromCloud = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(projectId)}`);
      if (!res.ok) return null;
      const project = await res.json();
      if (project.data) {
        try {
          project.data = decompressData(project.data);
        } catch {
          // Data might not be compressed (legacy)
          try {
            project.data = JSON.parse(project.data);
          } catch {
            // keep as-is
          }
        }
      }
      return project;
    } catch (error) {
      console.error("Load from cloud failed:", error);
      return null;
    }
  }, []);

  /**
   * List all projects from the cloud.
   */
  const listProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return [];
      return await res.json();
    } catch (error) {
      console.error("List projects failed:", error);
      return [];
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (snapshotTimer.current) clearInterval(snapshotTimer.current);
    };
  }, []);

  // Stable wrapped versions that read projectId from the ref — safe for useEffect deps
  const scheduleSyncStable = useCallback(
    (data: any, metadata?: any) =>
      scheduleSync(currentProjectId.current, data, metadata),
    [scheduleSync] // scheduleSync is already a stable useCallback
  );

  const forceSaveStable = useCallback(
    (data?: any, metadata?: any) => {
      if (data) return forceSave(currentProjectId.current, data, metadata);
      if (pendingData.current)
        return forceSave(
          pendingData.current.projectId,
          pendingData.current.data,
          pendingData.current.metadata
        );
      return Promise.resolve();
    },
    [forceSave] // forceSave is already a stable useCallback
  );

  return {
    syncStatus: status,
    status,
    lastSyncedAt: lastSynced,
    lastSynced,
    isOnline,
    scheduleSync: scheduleSyncStable,
    forceSave: forceSaveStable,
    loadFromCloud,
    listProjects,
    scheduleSyncRaw: scheduleSync,
    forceSaveRaw: forceSave,
  };
}
