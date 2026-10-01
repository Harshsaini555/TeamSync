export { WorkspaceRole } from "./workspace";

export enum UserRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  GUEST = "GUEST"
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE"
}

export interface INotificationPreferences {
  emailAlerts: boolean;
  taskAssigned: boolean;
  commentMentions: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  avatarUrl?: string;
  bio?: string;
  notificationPreferences?: INotificationPreferences;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
