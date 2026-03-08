'use client';

import { useState } from 'react';
import { ShoppingTemplate, DEFAULT_WEEKLY_TEMPLATE, getTemplateEstimatedTotal } from '../lib/templates';

interface TemplateManagerProps {
  currentTemplate: ShoppingTemplate;
  onResetToTemplate: () => void;
  onUpdateTemplate: (template: ShoppingTemplate) => void;
  currentNeedCount: number;
}

export function TemplateManager({ 
  currentTemplate, 
  onResetToTemplate, 
  onUpdateTemplate,
  currentNeedCount 
}: TemplateManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(currentTemplate.defaultBudget.toString());

  const estimatedTotal = getTemplateEstimatedTotal(currentTemplate);
  const withinBudget = estimatedTotal <= currentTemplate.defaultBudget;

  const handleBudgetChange = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      onUpdateTemplate({
        ...currentTemplate,
        defaultBudget: newBudget,
      });
      setIsEditing(false);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          📋 Template Semanal
        </h3>
        <span style={{
          fontSize: '12px',
          color: withinBudget ? '#22c55e' : '#ef4444',
          fontWeight: 500,
        }}>
          {currentTemplate.items.length} items • ~€{estimatedTotal.toFixed(0)}
        </span>
      </div>

      {/* Budget display/edit */}
      <div style={{
        background: '#f9fafb',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Orçamento Padrão</div>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  style={{
                    width: '80px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb',
                  }}
                />
                <button
                  onClick={handleBudgetChange}
                  style={{
                    padding: '4px 12px',
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  OK
                </button>
              </div>
            ) : (
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 700, 
                color: withinBudget ? '#1f2937' : '#dc2626' 
              }}>
                €{currentTemplate.defaultBudget}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '6px 12px',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>
        </div>
        
        {!withinBudget && (
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#dc2626',
          }}>
            ⚠️ Template excede orçamento em €{(estimatedTotal - currentTemplate.defaultBudget).toFixed(2)}
          </div>
        )}
      </div>

      {/* Weekly Reset Button */}
      <button
        onClick={onResetToTemplate}
        disabled={currentNeedCount > 0}
        style={{
          width: '100%',
          padding: '14px',
          background: currentNeedCount > 0 ? '#f3f4f6' : '#3b82f6',
          color: currentNeedCount > 0 ? '#9ca3af' : 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: currentNeedCount > 0 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        🔄 Começar Nova Semana
      </button>
      
      {currentNeedCount > 0 && (
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '11px',
          color: '#9ca3af',
          textAlign: 'center',
        }}>
          Completa as compras primeiro para resetar
        </p>
      )}

      {/* Template preview */}
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
          Itens do Template:
        </h4>
        <div style={{
          maxHeight: '150px',
          overflow: 'auto',
          fontSize: '12px',
        }}>
          {currentTemplate.items.map((item, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 8px',
                background: idx % 2 === 0 ? '#f9fafb' : 'white',
                borderRadius: '4px',
              }}
            >
              <span>{item.name}</span>
              <span style={{ color: '#6b7280' }}>
                {item.quantity} {item.unit}
                {item.unitPrice && ` • €${(item.unitPrice * item.quantity).toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
