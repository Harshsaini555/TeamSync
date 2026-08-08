import React from "react";
import { TaskStatus } from "@/types/task";
import { Circle, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const configs: Record<TaskStatus, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
    [TaskStatus.BACKLOG]: {
      label: "Backlog",
      bg: "bg-slate-500/10",
      text: "text-slate-400",
      border: "border-slate-500/20",
      icon: Circle
    },
    [TaskStatus.TODO]: {
      label: "To Do",
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      border: "border-sky-500/20",
      icon: Circle
    },
    [TaskStatus.IN_PROGRESS]: {
      label: "In Progress",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      icon: Clock
    },
    [TaskStatus.IN_REVIEW]: {
      label: "In Review",
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/20",
      icon: AlertCircle
    },
    [TaskStatus.DONE]: {
      label: "Done",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      icon: CheckCircle2
    },
    [TaskStatus.CANCELED]: {
      label: "Canceled",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/20",
      icon: XCircle
    }
  };

  const config = configs[status] || configs[TaskStatus.TODO];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono border font-medium",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  );
};
