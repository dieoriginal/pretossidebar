'use client';

import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, GroceryItem } from '../types';
import { autoCategorize, suggestItems } from '../lib/autoCategorize';

interface AddItemFormProps {
  onAdd: (item: {
    name: string;
    category: string;
    unit: string;
    unitPrice: number | null;
    quantity: number;
    status: GroceryItem['status'];
    note: string;
  }) => void;
}

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('unit');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [status, setStatus] = useState<GroceryItem['status']>('need');
  const [note, setNote] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-categorize when name changes
  useEffect(() => {
    if (name && !category) {
      const detected = autoCategorize(name);
      setCategory(detected);
    }
    
    if (name.length >= 2) {
      const items = suggestItems(name);
      setSuggestions(items);
      setShowSuggestions(items.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [name, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      category: category || autoCategorize(name),
      unit,
      unitPrice: unitPrice ? parseFloat(unitPrice) : null,
      quantity: parseFloat(quantity) || 1,
      status,
      note: note.trim(),
    });

    // Reset form
    setName('');
    setCategory('');
    setUnit('unit');
    setUnitPrice('');
    setQuantity('1');
    setStatus('need');
    setNote('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
    setCategory(autoCategorize(suggestion));
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>➕ Adicionar Item</h3>
      
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do produto..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '16px',
            boxSizing: 'border-box',
          }}
          autoFocus
        />
        
        {showSuggestions && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginTop: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 100,
            maxHeight: '150px',
            overflow: 'auto',
          }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
          }}
        >
          <option value="">Categoria...</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as GroceryItem['status'])}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
          }}
        >
          <option value="need">🔴 Preciso Comprar</option>
          <option value="have">✅ Tenho</option>
          <option value="running-low">🟡 Quase a Acabar</option>
          <option value="too-expensive">💰 Muito Caro</option>
          <option value="not-needed">⚪ Não Necessário</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Unidade"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
          }}
        />
        <input
          type="number"
          step="0.01"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          placeholder="Preço €"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
          }}
        />
        <input
          type="number"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qtd"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
          }}
        />
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota (opcional)..."
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          fontSize: '14px',
          marginBottom: '12px',
          boxSizing: 'border-box',
        }}
      />

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '12px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Adicionar à Lista
      </button>
    </form>
  );
}
