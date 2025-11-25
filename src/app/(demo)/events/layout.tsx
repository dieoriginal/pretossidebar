import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPanelLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </div>
    </AdminPanelLayout>
  );
}
