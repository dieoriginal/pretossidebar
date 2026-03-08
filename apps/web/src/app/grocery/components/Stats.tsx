'use client';

import { GroceryItem } from '../types';

interface StatsProps {
  items: GroceryItem[];
}

export function Stats({ items }: StatsProps) {
  const totalItems = items.length;
  const needItems = items.filter(i => i.status === 'need').length;
  const haveItems = items.filter(i => i.status === 'have').length;
  const runningLowItems = items.filter(i => i.status === 'running-low').length;
  
  const totalValue = items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0);
  const needValue = items
    .filter(i => i.status === 'need')
    .reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0);

  // Category breakdown
  const byCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = { count: 0, value: 0 };
    acc[item.category].count += 1;
    acc[item.category].value += (item.unitPrice || 0) * item.quantity;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>📊 Estatísticas</h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          background: '#fef2f2',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>{needItems}</div>
          <div style={{ fontSize: '11px', color: '#991b1b' }}>A comprar</div>
        </div>
        
        <div style={{
          background: '#f0fdf4',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>{haveItems}</div>
          <div style={{ fontSize: '11px', color: '#166534' }}>Comprados</div>
        </div>
        
        <div style={{
          background: '#fefce8',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ca8a04' }}>{runningLowItems}</div>
          <div style={{ fontSize: '11px', color: '#854d0e' }}>Quase a acabar</div>
        </div>
        
        <div style={{
          background: '#eff6ff',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>€{needValue.toFixed(0)}</div>
          <div style={{ fontSize: '11px', color: '#1e40af' }}>Valor a comprar</div>
        </div>
      </div>

      {Object.entries(byCategory).length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>Por Categoria</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(byCategory)
              .sort((a, b) => b[1].value - a[1].value)
              .slice(0, 5)
              .map(([category, data]) => (
                <div key={category} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}>
                  <span style={{ color: '#4b5563' }}>{category}</span>
                  <span style={{ color: '#6b7280' }}>
                    {data.count} items • €{data.value.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
