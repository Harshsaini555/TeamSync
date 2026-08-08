"use client";

import React from "react";
import { TaskPriority } from "@/types/task";
import { ProjectMemberUser } from "@/types/project";
import { Search, Filter, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  selectedAssignee: string;
  onAssigneeChange: (a: string) => void;
  members: ProjectMemberUser[];
  viewMode: "board" | "list";
  onViewModeChange: (mode: "board" | "list") => void;
}

export const BoardFilterBar: React.FC<BoardFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedAssignee,
  onAssigneeChange,
  members,
  viewMode,
  onViewModeChange
}) => {
  const priorities = [
    { value: "", label: "All Priorities" },
    { value: TaskPriority.URGENT, label: "Urgent" },
    { value: TaskPriority.HIGH, label: "High" },
    { value: TaskPriority.MEDIUM, label: "Medium" },
    { value: TaskPriority.LOW, label: "Low" }
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161b26] p-3 rounded-lg border border-slate-800">
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter issues (title, key...)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="h-8 bg-slate-900 border border-slate-800 rounded-md px-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Assignee Filter */}
        <select
          value={selectedAssignee}
          onChange={(e) => onAssigneeChange(e.target.value)}
          className="h-8 bg-slate-900 border border-slate-800 rounded-md px-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Assignees</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* View Switcher: Board vs List */}
      <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-md border border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => onViewModeChange("board")}
          className={cn(
            "flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
            viewMode === "board"
              ? "bg-slate-800 text-blue-400 font-semibold shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Board</span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={cn(
            "flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
            viewMode === "list"
              ? "bg-slate-800 text-blue-400 font-semibold shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <List className="h-3.5 w-3.5" />
          <span>List</span>
        </button>
      </div>
    </div>
  );
};
