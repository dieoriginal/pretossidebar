// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Welcome to Event Manager</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-6">Manage your events efficiently.</p>
      <Link 
        href="/events" 
        className="px-6 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
      >
        Go to Events Dashboard
      </Link>
    </div>
  );
}