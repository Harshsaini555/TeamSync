"use client";

import React from "react";
import { Task } from "@/types/task";
import { PriorityBadge } from "@/components/common/priority-badge";
import { CheckSquare, Calendar, Paperclip, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = React.memo(
  ({ task, isSelected = false, onSelect, onDragStart }) => {
    const completedChecklist = task.checklist?.filter((i) => i.isCompleted).length || 0;
    const totalChecklist = task.checklist?.length || 0;

    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, task)}
        onClick={() => onSelect(task)}
        className={cn(
          "group relative rounded-lg border border-slate-800 bg-[#161b26] p-3.5 shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing select-none hover:border-slate-700 hover:bg-slate-800/60",
          isSelected && "ring-2 ring-blue-500 border-blue-500 bg-slate-800/80 shadow-md"
        )}
      >
        {/* Header: Key & Priority */}
        <div className="flex items-center justify-between space-x-2 text-[11px] font-mono mb-2">
          <span className="font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
            {task.taskKey}
          </span>
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Title */}
        <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug mb-3">
          {task.title}
        </h4>

        {/* Labels Tags */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.labels.map((label, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700/60 px-1.5 py-0.2 rounded"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Checklist, Due Date, Assignee */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
          <div className="flex items-center space-x-3">
            {totalChecklist > 0 && (
              <span
                className={cn(
                  "flex items-center space-x-1",
                  completedChecklist === totalChecklist ? "text-emerald-400" : "text-slate-400"
                )}
                title="Checklist progress"
              >
                <CheckSquare className="h-3 w-3" />
                <span>
                  {completedChecklist}/{totalChecklist}
                </span>
              </span>
            )}

            {task.dueDate && (
              <span className="flex items-center space-x-1 text-slate-400" title="Due Date">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {task.assigneeId ? (
              <div
                className="h-5 w-5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[9px]"
                title={`Assignee: ${task.assigneeId.name}`}
              >
                {task.assigneeId.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div
                className="h-5 w-5 rounded-full bg-slate-800 text-slate-500 border border-slate-700/60 flex items-center justify-center font-mono text-[9px]"
                title="Unassigned"
              >
                ?
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

KanbanCard.displayName = "KanbanCard";
