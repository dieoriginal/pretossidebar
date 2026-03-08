'use client';

import { useState, useEffect } from 'react';
import { useGrocery } from './hooks/useGrocery';
import { BudgetCard } from './components/BudgetCard';
import { AddItemForm } from './components/AddItemForm';
import { ItemList } from './components/ItemList';
import { QuickActions } from './components/QuickActions';
import { Stats } from './components/Stats';
import { TemplateManager } from './components/TemplateManager';
import { 
  DEFAULT_WEEKLY_TEMPLATE, 
  getCurrentTemplate, 
  saveTemplate,
  shouldAutoReset,
  markAsReset,
  getLastResetDate,
  ShoppingTemplate,
} from './lib/templates';
import { GroceryItem } from './types';

export default function GroceryPage() {
  const {
    items,
    budget,
    isLoaded,
    totalNeed,
    totalSpent,
    needItems,
    haveItems,
    runningLowItems,
    addItem,
    deleteItem,
    toggleStatus,
    clearCompleted,
    setBudget,
    exportJSON,
    importJSON,
  } = useGrocery();

  const [activeTab, setActiveTab] = useState<'list' | 'stats' | 'template'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [template, setTemplate] = useState<ShoppingTemplate>(DEFAULT_WEEKLY_TEMPLATE);
  const [autoResetDone, setAutoResetDone] = useState(false);

  // Load template and check for auto-reset on mount
  useEffect(() => {
    if (!isLoaded) return;
    
    const savedTemplate = getCurrentTemplate();
    setTemplate(savedTemplate);

    // Check if we need to auto-reset (new week)
    if (shouldAutoReset() && !autoResetDone) {
      handleResetToTemplate(savedTemplate);
      setAutoResetDone(true);
    }
  }, [isLoaded, autoResetDone]);

  // Reset to template function
  const handleResetToTemplate = (templateToUse: ShoppingTemplate = template) => {
    // Clear current items
    clearCompleted();
    
    // Add template items
    templateToUse.items.forEach(item => {
      addItem({ ...item });
    });
    
    // Set budget from template
    setBudget(templateToUse.defaultBudget);
    
    // Mark as reset
    markAsReset();
    
    // Switch to list view
    setActiveTab('list');
  };

  // Update template
  const handleUpdateTemplate = (updatedTemplate: ShoppingTemplate) => {
    setTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  // First time setup - load initial data if empty
  useEffect(() => {
    if (isLoaded && items.length === 0 && !autoResetDone) {
      handleResetToTemplate();
      setAutoResetDone(true);
    }
  }, [isLoaded, items.length, autoResetDone, template]);

  const handleExport = () => {
    const data = exportJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (data: string) => {
    if (importJSON(data)) {
      window.location.reload();
    } else {
      alert('Erro ao importar dados');
    }
  };

  // Get last reset info
  const lastReset = getLastResetDate();
  const nextReset = lastReset ? new Date(lastReset.getTime() + 7 * 24 * 60 * 60 * 1000) : null;

  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#6b7280',
      }}>
        A carregar...
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '16px',
      background: '#f3f4f6',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
      }}>
        <h1 style={{
          margin: '0 0 4px 0',
          fontSize: '24px',
          fontWeight: 700,
          color: '#1f2937',
        }}>
          🛒 Lista de Compras
        </h1>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: '#6b7280',
        }}>
          Acesso em qualquer lugar • Sempre atualizado
        </p>
        {nextReset && (
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '11px',
            color: '#9ca3af',
          }}>
            Próximo reset: {nextReset.toLocaleDateString('pt-PT')}
          </p>
        )}
      </div>

      {/* Budget Card */}
      <BudgetCard
        budget={budget}
        totalSpent={totalSpent}
        totalNeed={totalNeed}
        onSetBudget={setBudget}
      />

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '16px',
        background: 'white',
        padding: '4px',
        borderRadius: '10px',
      }}>
        {[
          { id: 'list', label: `Lista (${needItems.length})`, icon: '📋' },
          { id: 'template', label: 'Template', icon: '📋' },
          { id: 'stats', label: 'Stats', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'list' && (
        <>
          {/* Add Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              width: '100%',
              padding: '14px',
              background: showAddForm ? '#dc2626' : '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {showAddForm ? '✕ Cancelar' : '➕ Adicionar Extra'}
          </button>

          {/* Add Form */}
          {showAddForm && (
            <AddItemForm
              onAdd={(item) => {
                addItem(item);
                setShowAddForm(false);
              }}
            />
          )}

          <ItemList
            items={needItems}
            onToggle={toggleStatus}
            onDelete={deleteItem}
            title="📝 Para Comprar"
            emptyMessage="Nada para comprar! A lista será resetada automaticamente a cada semana."
          />

          {runningLowItems.length > 0 && (
            <ItemList
              items={runningLowItems}
              onToggle={toggleStatus}
              onDelete={deleteItem}
              title="⚠️ Quase a Acabar"
              emptyMessage=""
            />
          )}

          {haveItems.length > 0 && (
            <ItemList
              items={haveItems}
              onToggle={toggleStatus}
              onDelete={deleteItem}
              title="✅ Já Tenho"
              emptyMessage=""
            />
          )}

          <QuickActions
            onClearCompleted={clearCompleted}
            onExport={handleExport}
            onImport={handleImport}
            needCount={needItems.length}
            haveCount={haveItems.length}
          />
        </>
      )}

      {activeTab === 'template' && (
        <TemplateManager
          currentTemplate={template}
          onResetToTemplate={() => handleResetToTemplate()}
          onUpdateTemplate={handleUpdateTemplate}
          currentNeedCount={needItems.length}
        />
      )}

      {activeTab === 'stats' && (
        <Stats items={items} />
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        fontSize: '12px',
        color: '#9ca3af',
      }}>
        <p>Grocery Budget Manager</p>
        <p>Baseado em &quot;Millionaire Next Door&quot; 💰</p>
        <p style={{ marginTop: '8px', fontSize: '10px' }}>
          Disciplina = Liberdade Financeira
        </p>
      </div>
    </div>
  );
}
