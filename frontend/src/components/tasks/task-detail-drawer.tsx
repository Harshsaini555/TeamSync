"use client";

import React, { useState, useEffect } from "react";
import { useTaskDetails } from "@/hooks/use-tasks";
import { TaskStatus, TaskPriority, ChecklistItem, SubtaskItem } from "@/types/task";
import { ProjectMemberUser } from "@/types/project";
import { StatusBadge } from "@/components/common/status-badge";
import { PriorityBadge } from "@/components/common/priority-badge";
import { TaskCommentSection } from "./task-comment-section";
import { TaskActivitySection } from "./task-activity-section";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  X,
  Trash2,
  Calendar,
  Clock,
  UserCheck,
  CheckSquare,
  Plus,
  ListTodo,
  MessageSquare,
  Activity,
  Tag
} from "lucide-react";

interface TaskDetailDrawerProps {
  taskId: string | null;
  members: ProjectMemberUser[];
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ taskId, members, isOpen, onClose }) => {
  const { task, isLoading, updateTask, deleteTask } = useTaskDetails(taskId || undefined);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId?._id || "");
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
      setEstimatedTime(task.estimatedTime || 0);
    }
  }, [task]);

  if (!isOpen || !taskId) return null;

  const handleTitleBlur = async () => {
    if (title !== task?.title && title.trim()) {
      await updateTask({ title });
    }
  };

  const handleDescriptionBlur = async () => {
    if (description !== task?.description) {
      await updateTask({ description });
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    await updateTask({ status: newStatus });
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setPriority(newPriority);
    await updateTask({ priority: newPriority });
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    setAssigneeId(newAssigneeId);
    await updateTask({ assigneeId: newAssigneeId || (null as any) });
  };

  const handleDueDateChange = async (newDueDate: string) => {
    setDueDate(newDueDate);
    await updateTask({ dueDate: newDueDate || (null as any) });
  };

  const handleEstimatedTimeChange = async (time: number) => {
    setEstimatedTime(time);
    await updateTask({ estimatedTime: time });
  };

  // Checklist handlers
  const handleToggleChecklist = async (index: number) => {
    if (!task) return;
    const updated = [...task.checklist];
    updated[index].isCompleted = !updated[index].isCompleted;
    await updateTask({ checklist: updated });
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim() || !task) return;
    const updated = [...task.checklist, { title: newChecklistTitle, isCompleted: false }];
    await updateTask({ checklist: updated });
    setNewChecklistTitle("");
  };

  // Subtask handlers
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task) return;
    const updated = [...task.subtasks, { title: newSubtaskTitle, status: TaskStatus.TODO }];
    await updateTask({ subtasks: updated });
    setNewSubtaskTitle("");
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    if (confirm(`Delete issue ${task.taskKey}?`)) {
      await deleteTask();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-2xl bg-[#161b26] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Top Bar */}
          <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-[#161b26]">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                {task?.taskKey || "LOADING..."}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{task?.projectId?.name}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                onClick={handleDeleteTask}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          {isLoading || !task ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">Loading issue details...</div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title Section */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  className="w-full bg-transparent text-lg font-bold text-slate-100 focus:outline-none border-b border-transparent focus:border-blue-500 pb-1"
                />
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase">Status</span>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value={TaskStatus.BACKLOG}>Backlog</option>
                    <option value={TaskStatus.TODO}>To Do</option>
                    <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TaskStatus.IN_REVIEW}>In Review</option>
                    <option value={TaskStatus.DONE}>Done</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase">Priority</span>
                  <select
                    value={priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                    <option value={TaskPriority.URGENT}>Urgent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase">Assignee</span>
                  <select
                    value={assigneeId}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase">Due Date</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  placeholder="Add a detailed description..."
                  className="w-full rounded-md border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Checklist Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center">
                    <CheckSquare className="h-4 w-4 mr-1.5 text-blue-400" /> Checklist (
                    {task.checklist.filter((i) => i.isCompleted).length}/{task.checklist.length})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {task.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5 text-xs">
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={() => handleToggleChecklist(idx)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                      />
                      <span className={item.isCompleted ? "line-through text-slate-500" : "text-slate-200"}>
                        {item.title}
                      </span>
                    </div>
                  ))}

                  <form onSubmit={handleAddChecklist} className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add checklist item..."
                      value={newChecklistTitle}
                      onChange={(e) => setNewChecklistTitle(e.target.value)}
                      className="flex-1 h-7 bg-slate-900 border border-slate-800 rounded px-2 text-xs text-slate-100 focus:outline-none"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="h-7 text-xs">
                      Add
                    </Button>
                  </form>
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center">
                    <ListTodo className="h-4 w-4 mr-1.5 text-amber-400" /> Subtasks ({task.subtasks.length})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {task.subtasks.map((st, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800 text-xs">
                      <span className="text-slate-200">{st.title}</span>
                      <StatusBadge status={st.status} />
                    </div>
                  ))}

                  <form onSubmit={handleAddSubtask} className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 h-7 bg-slate-900 border border-slate-800 rounded px-2 text-xs text-slate-100 focus:outline-none"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="h-7 text-xs">
                      Add
                    </Button>
                  </form>
                </div>
              </div>

              {/* Tab Navigation for Comments vs Activity */}
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center space-x-4 border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab("comments")}
                    className={`pb-2 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors ${
                      activeTab === "comments"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Comments</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("activity")}
                    className={`pb-2 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors ${
                      activeTab === "activity"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>Activity History</span>
                  </button>
                </div>

                {activeTab === "comments" ? (
                  <TaskCommentSection taskId={task._id} />
                ) : (
                  <TaskActivitySection taskId={task._id} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
