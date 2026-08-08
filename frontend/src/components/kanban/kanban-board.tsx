"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Task, TaskStatus } from "@/types/task";
import { ProjectMemberUser } from "@/types/project";
import { KanbanColumn } from "./kanban-column";
import { BoardFilterBar } from "./board-filter-bar";
import { TaskDetailDrawer } from "../tasks/task-detail-drawer";
import { CreateTaskModal } from "../tasks/create-task-modal";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface KanbanBoardProps {
  projectId: string;
  projectKey: string;
  tasks: Task[];
  members: ProjectMemberUser[];
  isLoading: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  projectKey,
  tasks: initialTasks,
  members,
  isLoading
}) => {
  const queryClient = useQueryClient();

  const [localTasks, setLocalTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>(TaskStatus.TODO);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [focusedTaskIndex, setFocusedTaskIndex] = useState<number>(0);

  useEffect(() => {
    setLocalTasks(initialTasks);
  }, [initialTasks]);

  // Column definitions
  const columns: { status: TaskStatus; title: string }[] = [
    { status: TaskStatus.TODO, title: "To Do" },
    { status: TaskStatus.IN_PROGRESS, title: "In Progress" },
    { status: TaskStatus.IN_REVIEW, title: "In Review" },
    { status: TaskStatus.DONE, title: "Done" }
  ];

  // Filtering tasks
  const filteredTasks = useMemo(() => {
    return localTasks.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.taskKey.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = !selectedPriority || t.priority === selectedPriority;
      const matchesAssignee = !selectedAssignee || t.assigneeId?._id === selectedAssignee;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [localTasks, searchQuery, selectedPriority, selectedAssignee]);

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.setData("text/plain", task._id);
  }, []);

  const handleDropTask = useCallback(
    async (e: React.DragEvent, targetStatus: TaskStatus) => {
      const taskId = e.dataTransfer.getData("text/plain") || draggedTask?._id;
      if (!taskId) return;

      const taskToMove = localTasks.find((t) => t._id === taskId);
      if (!taskToMove || taskToMove.status === targetStatus) return;

      // 1. Synchronous Optimistic Update
      const previousTasks = [...localTasks];
      setLocalTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
      );

      // 2. Background API Auto-save
      try {
        await apiClient.patch(`/tasks/${taskId}`, { status: targetStatus });
        queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      } catch (error) {
        // Rollback on failure
        console.error("Failed to update task status:", error);
        setLocalTasks(previousTasks);
      } finally {
        setDraggedTask(null);
      }
    },
    [draggedTask, localTasks, projectId, queryClient]
  );

  // Keyboard navigation shortcuts (J/K/H/L/Enter/C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        isDetailDrawerOpen ||
        isCreateModalOpen
      ) {
        return;
      }

      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setIsCreateModalOpen(true);
      } else if (e.key === "Enter" || e.key === " ") {
        if (filteredTasks[focusedTaskIndex]) {
          e.preventDefault();
          setSelectedTaskId(filteredTasks[focusedTaskIndex]._id);
          setIsDetailDrawerOpen(true);
        }
      } else if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedTaskIndex((prev) => Math.min(prev + 1, filteredTasks.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedTaskIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredTasks, focusedTaskIndex, isDetailDrawerOpen, isCreateModalOpen]);

  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task._id);
    setIsDetailDrawerOpen(true);
  };

  const handleQuickCreateTask = (status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* Filter Bar */}
      <BoardFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        members={members}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* View Engine: Board vs List */}
      {viewMode === "board" ? (
        <div className="flex items-start space-x-4 overflow-x-auto pb-4 custom-scrollbar flex-1">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <KanbanColumn
                key={col.status}
                status={col.status}
                title={col.title}
                tasks={colTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={handleSelectTask}
                onDragStart={handleDragStart}
                onDropTask={handleDropTask}
                onQuickCreateTask={handleQuickCreateTask}
              />
            );
          })}
        </div>
      ) : (
        /* Dense Issue List View */
        <div className="rounded-lg border border-slate-800 bg-[#161b26] overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase bg-slate-900/60">
                  <th className="py-2.5 px-4">Key</th>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Assignee</th>
                  <th className="py-2.5 px-4 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                      No issues found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr
                      key={t._id}
                      onClick={() => handleSelectTask(t)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">{t.taskKey}</td>
                      <td className="py-3 px-4 font-semibold text-slate-100">{t.title}</td>
                      <td className="py-3 px-4">{t.status}</td>
                      <td className="py-3 px-4">{t.priority}</td>
                      <td className="py-3 px-4 text-slate-400">{t.assigneeId?.name || "Unassigned"}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        members={members}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      />

      {/* Task Creation Modal */}
      <CreateTaskModal
        projectId={projectId}
        projectKey={projectKey}
        members={members}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus={createDefaultStatus}
      />
    </div>
  );
};
