"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateStaffInviteRequest, SplitType } from 'shared-logic';
import { Loader2 } from 'lucide-react';

interface StaffInviteFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export function StaffInviteForm({ eventId, onSuccess }: StaffInviteFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateStaffInviteRequest>({
    event_id: eventId,
    email: '',
    name: '',
    role: '',
    split_type: 'percentage',
    split_value: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}/staff/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar convite');
      }

      const data = await response.json();
      alert(`Convite enviado! Link: ${data.invite_link}`);
      
      // Reset form
      setFormData({
        event_id: eventId,
        email: '',
        name: '',
        role: '',
        split_type: 'percentage',
        split_value: 0,
      });

      onSuccess?.();
    } catch (error: any) {
      alert(error.message || 'Erro ao enviar convite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convidar Staff</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="ex: DJ, Sound Engineer, Lighting"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="split_type">Tipo de Split</Label>
            <Select
              value={formData.split_type}
              onValueChange={(value: SplitType) => 
                setFormData({ ...formData, split_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                <SelectItem value="fixed">Valor Fixo (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="split_value">
              {formData.split_type === 'percentage' ? 'Porcentagem (%)' : 'Valor Fixo (€)'}
            </Label>
            <Input
              id="split_value"
              type="number"
              step={formData.split_type === 'percentage' ? '1' : '0.01'}
              min="0"
              value={formData.split_value}
              onChange={(e) => 
                setFormData({ ...formData, split_value: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Convite'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
