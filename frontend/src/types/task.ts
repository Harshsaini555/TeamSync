import { User } from "./index";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
  CANCELED = "CANCELED"
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

export interface ChecklistItem {
  _id?: string;
  title: string;
  isCompleted: boolean;
}

export interface SubtaskItem {
  _id?: string;
  title: string;
  status: TaskStatus;
  assigneeId?: string;
}

export interface TaskUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface TaskProject {
  _id: string;
  name: string;
  key: string;
  color?: string;
}

export interface Task {
  _id: string;
  projectId: TaskProject;
  workspaceId: string;
  taskNumber: number;
  taskKey: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  assigneeId?: TaskUser;
  reporterId: TaskUser;
  dueDate?: string;
  estimatedTime?: number;
  position: number;
  checklist: ChecklistItem[];
  subtasks: SubtaskItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  labels?: string[];
  assigneeId?: string;
  dueDate?: string;
  estimatedTime?: number;
  checklist?: ChecklistItem[];
  subtasks?: SubtaskItem[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  labels?: string[];
  assigneeId?: string | null;
  dueDate?: string | null;
  estimatedTime?: number;
  position?: number;
  checklist?: ChecklistItem[];
  subtasks?: SubtaskItem[];
}

export interface TaskComment {
  _id: string;
  taskId: string;
  authorId: TaskUser;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export enum ActivityAction {
  TASK_CREATED = "TASK_CREATED",
  STATUS_CHANGED = "STATUS_CHANGED",
  PRIORITY_CHANGED = "PRIORITY_CHANGED",
  ASSIGNEE_CHANGED = "ASSIGNEE_CHANGED",
  COMMENT_ADDED = "COMMENT_ADDED",
  TITLE_UPDATED = "TITLE_UPDATED",
  DESCRIPTION_UPDATED = "DESCRIPTION_UPDATED"
}

export interface ActivityLog {
  _id: string;
  taskId: string;
  userId: TaskUser;
  action: ActivityAction;
  details: string;
  createdAt: string;
}
