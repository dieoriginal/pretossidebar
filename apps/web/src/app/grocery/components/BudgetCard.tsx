'use client';

import { useState } from 'react';
import { WeeklyBudget } from '../types';

interface BudgetCardProps {
  budget: WeeklyBudget | null;
  totalSpent: number;
  totalNeed: number;
  onSetBudget: (amount: number) => void;
}

export function BudgetCard({ budget, totalSpent, totalNeed, onSetBudget }: BudgetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget?.budgetAmount?.toString() || '50');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newBudget);
    if (!isNaN(amount) && amount > 0) {
      onSetBudget(amount);
      setIsEditing(false);
    }
  };

  const budgetAmount = budget?.budgetAmount || 0;
  const remaining = budgetAmount - totalSpent;
  const projectedTotal = totalSpent + totalNeed;
  const percentUsed = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
  const percentProjected = budgetAmount > 0 ? (projectedTotal / budgetAmount) * 100 : 0;

  const getStatusColor = () => {
    if (percentUsed >= 100) return '#ef4444';
    if (percentUsed >= 80) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '20px',
      color: 'white',
      marginBottom: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>💰 Orçamento Semanal</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="number"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            placeholder="Orçamento semanal"
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
            }}
          />
          <button
            type="submit"
            style={{
              background: '#22c55e',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Guardar
          </button>
        </form>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>€{remaining.toFixed(2)}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>disponível</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px' }}>Orçamento: €{budgetAmount.toFixed(2)}</div>
              <div style={{ fontSize: '14px' }}>Gasto: €{totalSpent.toFixed(2)}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            height: '8px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px',
          }}>
            <div style={{
              width: `${Math.min(percentUsed, 100)}%`,
              height: '100%',
              background: getStatusColor(),
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Projected spending */}
          {totalNeed > 0 && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>📋 Lista de compras:</span>
                <span>€{totalNeed.toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '14px',
                fontWeight: 600,
                marginTop: '4px',
                paddingTop: '4px',
                borderTop: '1px solid rgba(255,255,255,0.2)',
              }}>
                <span>Total previsto:</span>
                <span style={{ 
                  color: percentProjected > 100 ? '#fca5a5' : '#86efac',
                }}>
                  €{projectedTotal.toFixed(2)}
                  {percentProjected > 100 && ' ⚠️'}
                </span>
              </div>
            </div>
          )}

          {/* Week info */}
          {budget && (
            <div style={{ 
              marginTop: '12px', 
              fontSize: '11px', 
              opacity: 0.7,
              textAlign: 'center',
            }}>
              Semana: {new Date(budget.weekStart).toLocaleDateString('pt-PT')} - {new Date(budget.weekEnd).toLocaleDateString('pt-PT')}
            </div>
          )}
        </>
      )}
    </div>
  );
}
