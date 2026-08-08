import React from "react";
import { TaskPriority } from "@/types/task";
import { SignalLow, SignalMedium, SignalHigh, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const configs: Record<TaskPriority, { label: string; text: string; icon: React.ElementType }> = {
    [TaskPriority.LOW]: {
      label: "Low",
      text: "text-slate-400",
      icon: SignalLow
    },
    [TaskPriority.MEDIUM]: {
      label: "Medium",
      text: "text-sky-400",
      icon: SignalMedium
    },
    [TaskPriority.HIGH]: {
      label: "High",
      text: "text-amber-400",
      icon: SignalHigh
    },
    [TaskPriority.URGENT]: {
      label: "Urgent",
      text: "text-rose-400",
      icon: AlertOctagon
    }
  };

  const config = configs[priority] || configs[TaskPriority.MEDIUM];
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center space-x-1 text-[11px] font-mono", config.text, className)}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
