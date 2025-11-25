"use client";
import React from "react";

type Props = {
  label: string;
  value: string;
  accent?: boolean;
};

export default function KPIWidget({ label, value, accent = false }: Props) {
  return (
    <div className={`flex items-center justify-between rounded p-3 ${accent ? "bg-indigo-600 text-white" : "bg-slate-50"}`}>
      <div className="text-xs">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
