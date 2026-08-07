import { Request } from "express";
import { UserRole, AuthProvider } from "../constants/enums";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  tokenType: "ACCESS" | "REFRESH";
  iat?: number;
  exp?: number;
}

export interface AuthUserDTO {
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
  user: AuthUserDTO;
  tokens: AuthTokens;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
