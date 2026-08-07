export enum UserRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  GUEST = "GUEST"
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
