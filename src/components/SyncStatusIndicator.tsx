/**
 * SyncStatusIndicator — shows the current save/sync status.
 * Displays in the bottom-right corner or wherever placed.
 * 
 * States:
 *   idle     → nothing shown
 *   saving   → "Saving..." (yellow dot)
 *   saved    → "Saved locally" (green dot, fades)
 *   syncing  → "Syncing..." (blue pulse)
 *   synced   → "✓ Synced" (green, with timestamp)
 *   offline  → "Offline — saved locally" (orange)
 *   error    → "Sync error" (red)
 */

"use client";

import React, { useEffect, useState } from "react";
import type { SyncStatus } from "@/hooks/use-cloud-sync";
import { Cloud, CloudOff, Check, AlertCircle, Loader2, Save } from "lucide-react";

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  lastSynced?: string | null;
  isOnline?: boolean;
  className?: string;
}

export function SyncStatusIndicator({
  status,
  lastSynced,
  isOnline = true,
  className = "",
}: SyncStatusIndicatorProps) {
  const [visible, setVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "idle") {
      setVisible(false);
      return;
    }

    setVisible(true);

    // Auto-hide after sync success
    if (status === "synced" || status === "saved") {
      if (hideTimeout) clearTimeout(hideTimeout);
      const t = setTimeout(() => setVisible(false), 4000);
      setHideTimeout(t);
    }

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [status]);

  if (!visible && status === "idle") return null;

  const config: Record<
    SyncStatus,
    { icon: React.ReactNode; label: string; color: string; pulse?: boolean }
  > = {
    idle: { icon: null, label: "", color: "" },
    saving: {
      icon: <Save className="h-3 w-3" />,
      label: "A guardar...",
      color: "text-yellow-500",
    },
    saved: {
      icon: <Check className="h-3 w-3" />,
      label: "Guardado localmente",
      color: "text-green-500",
    },
    syncing: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      label: "A sincronizar...",
      color: "text-blue-500",
      pulse: true,
    },
    synced: {
      icon: <Cloud className="h-3 w-3" />,
      label: "Sincronizado",
      color: "text-green-500",
    },
    offline: {
      icon: <CloudOff className="h-3 w-3" />,
      label: "Offline — guardado localmente",
      color: "text-orange-500",
    },
    error: {
      icon: <AlertCircle className="h-3 w-3" />,
      label: "Erro de sincronização",
      color: "text-red-500",
    },
  };

  const c = config[status];
  if (!c.icon) return null;

  const timeAgo = lastSynced
    ? formatTimeAgo(new Date(lastSynced))
    : null;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      } bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 ${c.color} ${className}`}
    >
      {c.pulse ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
      ) : (
        c.icon
      )}
      <span>{c.label}</span>
      {timeAgo && status === "synced" && (
        <span className="text-zinc-500 ml-1">({timeAgo})</span>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "agora";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}
