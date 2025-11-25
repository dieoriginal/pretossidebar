"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: number; msg: string; kind?: "success" | "error" | "info" };

const ToastCtx = createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastLiteProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2500);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[9999]">
        {toasts.map((t) => (
          <div key={t.id} className={`px-3 py-2 rounded text-white shadow ${t.kind === 'error' ? 'bg-red-600' : t.kind === 'info' ? 'bg-blue-600' : 'bg-green-600'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToastLite() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToastLite must be used within ToastLiteProvider");
  return ctx;
}
