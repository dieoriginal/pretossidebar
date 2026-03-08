'use client';

interface QuickActionsProps {
  onClearCompleted: () => void;
  onExport: () => void;
  onImport: (data: string) => void;
  needCount: number;
  haveCount: number;
}

export function QuickActions({ onClearCompleted, onExport, onImport, needCount, haveCount }: QuickActionsProps) {
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onImport(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    }}>
      <button
        onClick={onClearCompleted}
        disabled={haveCount === 0}
        style={{
          flex: 1,
          minWidth: '120px',
          padding: '10px',
          background: haveCount > 0 ? '#fef3c7' : '#f3f4f6',
          border: 'none',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 500,
          color: haveCount > 0 ? '#92400e' : '#9ca3af',
          cursor: haveCount > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        🗑️ Limpar Comprados ({haveCount})
      </button>

      <button
        onClick={onExport}
        style={{
          flex: 1,
          minWidth: '100px',
          padding: '10px',
          background: '#dbeafe',
          border: 'none',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 500,
          color: '#1e40af',
          cursor: 'pointer',
        }}
      >
        📥 Exportar
      </button>

      <button
        onClick={handleImport}
        style={{
          flex: 1,
          minWidth: '100px',
          padding: '10px',
          background: '#d1fae5',
          border: 'none',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 500,
          color: '#065f46',
          cursor: 'pointer',
        }}
      >
        📤 Importar
      </button>
    </div>
  );
}
