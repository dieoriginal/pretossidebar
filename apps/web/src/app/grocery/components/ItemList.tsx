'use client';

import { GroceryItem } from '../types';
import { STATUS_LABELS } from '../types';
import { getCategoryEmoji } from '../lib/autoCategorize';

interface ItemListProps {
  items: GroceryItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  title: string;
  emptyMessage: string;
}

export function ItemList({ items, onToggle, onDelete, title, emptyMessage }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '32px 16px',
        color: '#9ca3af',
        fontSize: '14px',
      }}>
        {emptyMessage}
      </div>
    );
  }

  // Group by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{
        margin: '0 0 12px 0',
        fontSize: '14px',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {title} ({items.length})
      </h3>

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#4b5563',
          }}>
            <span>{getCategoryEmoji(category as any)}</span>
            <span>{category}</span>
            <span style={{ color: '#9ca3af', fontWeight: 400 }}>({categoryItems.length})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categoryItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  background: item.status === 'have' ? '#f0fdf4' : 'white',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                }}
              >
                <button
                  onClick={() => onToggle(item.id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: item.status === 'have' ? '2px solid #22c55e' : '2px solid #d1d5db',
                    background: item.status === 'have' ? '#22c55e' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.status === 'have' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: item.status === 'have' ? '#166534' : '#1f2937',
                    textDecoration: item.status === 'have' ? 'line-through' : 'none',
                  }}>
                    {item.name}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '2px',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}>
                    <span>{item.quantity} {item.unit}</span>
                    {item.unitPrice && (
                      <span>• €{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    )}
                    {item.status && item.status !== 'need' && item.status !== 'have' && (
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: (STATUS_LABELS[item.status]?.color || '#6b7280') + '20',
                        color: STATUS_LABELS[item.status]?.color || '#6b7280',
                        fontSize: '10px',
                      }}>
                        {STATUS_LABELS[item.status]?.label}
                      </span>
                    )}
                  </div>

                  {item.note && (
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      marginTop: '4px',
                      fontStyle: 'italic',
                    }}>
                      {item.note}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDelete(item.id)}
                  style={{
                    padding: '6px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
