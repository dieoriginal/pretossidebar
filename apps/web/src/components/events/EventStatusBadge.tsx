"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventCompletionStatus, getEventStatusLabel } from "@/lib/event-completion-tracker";

interface EventStatusBadgeProps {
  status: EventCompletionStatus;
  showProgress?: boolean;
}

export function EventStatusBadge({ status, showProgress = true }: EventStatusBadgeProps) {
  const statusInfo = getEventStatusLabel(status);
  
  const getIcon = () => {
    if (status.isComplete) {
      return <CheckCircle2 className="h-3 w-3" />;
    }
    if (status.completionPercentage >= 80) {
      return <AlertCircle className="h-3 w-3" />;
    }
    return <XCircle className="h-3 w-3" />;
  };

  const getColorClasses = () => {
    if (status.isComplete) {
      return "bg-green-500 text-white border-green-600 hover:bg-green-600";
    }
    if (status.completionPercentage >= 80) {
      return "bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600";
    }
    return "bg-red-500 text-white border-red-600 hover:bg-red-600";
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={cn("flex items-center gap-1", getColorClasses())}>
        {getIcon()}
        {statusInfo.label}
      </Badge>
      {showProgress && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {status.completedSteps}/{status.totalSteps} passos
          {status.completionPercentage < 100 && (
            <span className="ml-1">({status.completionPercentage}%)</span>
          )}
        </div>
      )}
    </div>
  );
}




