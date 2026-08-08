import { TaskUser } from "./task";

export enum NotificationType {
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_UPDATED = "TASK_UPDATED",
  COMMENT_ADDED = "COMMENT_ADDED",
  USER_MENTIONED = "USER_MENTIONED"
}

export interface NotificationItem {
  _id: string;
  recipientId: string;
  senderId: TaskUser;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
