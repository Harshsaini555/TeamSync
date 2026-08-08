import { z } from "zod";
import { TaskStatus, TaskPriority } from "../constants/enums";

export const checklistItemSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, "Checklist title is required"),
  isCompleted: z.boolean().default(false)
});

export const subtaskItemSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, "Subtask title is required"),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  assigneeId: z.string().optional()
});

export const createTaskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  labels: z.array(z.string()).optional().default([]),
  assigneeId: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  estimatedTime: z.number().min(0).optional().default(0),
  checklist: z.array(checklistItemSchema).optional().default([]),
  subtasks: z.array(subtaskItemSchema).optional().default([])
});

export const updateTaskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters").max(100, "Title cannot exceed 100 characters").optional(),
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  labels: z.array(z.string()).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  estimatedTime: z.number().min(0).optional(),
  position: z.number().optional(),
  checklist: z.array(checklistItemSchema).optional(),
  subtasks: z.array(subtaskItemSchema).optional()
});

export const addCommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty").max(1000, "Comment cannot exceed 1000 characters")
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
