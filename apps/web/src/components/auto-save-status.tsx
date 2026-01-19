"use client";

import React from 'react';
import { SaveStatus } from '@/lib/auto-save-storage';
import { Loader2, Check, Cloud, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveStatusProps {
  status: SaveStatus;
  className?: string;
}

export function AutoSaveStatus({ status, className }: AutoSaveStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          text: 'Salvando...',
          className: 'text-blue-600 dark:text-blue-400',
        };
      case 'saved':
        return {
          icon: <Check className="w-3 h-3" />,
          text: 'Salvo',
          className: 'text-green-600 dark:text-green-400',
        };
      case 'syncing':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          text: 'Sincronizando...',
          className: 'text-blue-600 dark:text-blue-400',
        };
      case 'synced':
        return {
          icon: <Cloud className="w-3 h-3" />,
          text: 'Sincronizado',
          className: 'text-green-600 dark:text-green-400',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          text: 'Erro',
          className: 'text-red-600 dark:text-red-400',
        };
      default:
        return {
          icon: <Circle className="w-3 h-3" />,
          text: '',
          className: 'text-muted-foreground',
        };
    }
  };

  const config = getStatusConfig();

  if (status === 'idle' && !config.text) {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-xs',
        config.className,
        className
      )}
    >
      {config.icon}
      {config.text && <span>{config.text}</span>}
    </div>
  );
}












