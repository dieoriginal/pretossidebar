import React from "react";

type Props = {
  label: string;
  value: string;
  accent?: boolean;
};

export default function KPIWidget({ label, value, accent = false }: Props) {
  return (
    <div className={`flex items-center justify-between rounded p-3 border ${
      accent 
        ? "bg-indigo-600 text-white border-indigo-500 dark:border-indigo-400" 
        : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
    }`}>
      <div className="text-xs">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
