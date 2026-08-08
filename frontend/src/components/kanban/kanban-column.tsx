"use client";

import React, { useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { StatusBadge } from "@/components/common/status-badge";
import { KanbanCard } from "./kanban-card";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDropTask: (e: React.DragEvent, targetStatus: TaskStatus) => void;
  onQuickCreateTask: (status: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  selectedTaskId,
  onSelectTask,
  onDragStart,
  onDropTask,
  onQuickCreateTask
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDropTask(e, status);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col w-80 shrink-0 rounded-xl bg-[#0f141f]/70 border border-slate-800/80 p-3 max-h-full transition-colors",
        isDragOver && "border-blue-500/80 bg-blue-950/20 ring-1 ring-blue-500/40"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 pb-3 border-b border-slate-800/60 mb-3">
        <div className="flex items-center space-x-2">
          <StatusBadge status={status} />
          <span className="text-xs font-mono font-medium text-slate-400">({tasks.length})</span>
        </div>

        <button
          type="button"
          onClick={() => onQuickCreateTask(status)}
          className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1 rounded transition-colors"
          title="Add issue to this column"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Task List Container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar min-h-[150px]">
        {tasks.length === 0 ? (
          <div className="h-28 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-600 font-mono">
            Drop tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task._id}
              task={task}
              isSelected={task._id === selectedTaskId}
              onSelect={onSelectTask}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};
