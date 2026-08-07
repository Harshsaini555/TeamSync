"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, AuthResponseData } from "@/types";
import { tokenManager } from "@/lib/token";
import { apiClient } from "@/lib/api-client";
import {
  LoginFormValues,
  RegisterFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues
} from "@/validators/auth.schema";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (values: LoginFormValues) => Promise<void>;
  register: (values: RegisterFormValues) => Promise<string>;
  logout: () => Promise<void>;
  forgotPassword: (values: ForgotPasswordFormValues) => Promise<string>;
  resetPassword: (token: string, values: ResetPasswordFormValues) => Promise<string>;
  verifyEmail: (token: string) => Promise<string>;
  googleAuth: (idToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get("/auth/me");
      setUser(response.data.data);
    } catch {
      tokenManager.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{ data: AuthResponseData }>("/auth/login", values);
      const { user: userData, tokens } = response.data.data;
      tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (values: RegisterFormValues): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password
      });
      return response.data.message;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      console.warn("Logout request failed:", e);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      setIsLoading(false);
      router.push("/login");
    }
  };

  const forgotPassword = async (values: ForgotPasswordFormValues): Promise<string> => {
    const response = await apiClient.post("/auth/forgot-password", values);
    return response.data.message;
  };

  const resetPassword = async (token: string, values: ResetPasswordFormValues): Promise<string> => {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      newPassword: values.newPassword
    });
    return response.data.message;
  };

  const verifyEmail = async (token: string): Promise<string> => {
    const response = await apiClient.post("/auth/verify-email", { token });
    return response.data.message;
  };

  const googleAuth = async (idToken: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{ data: AuthResponseData }>("/auth/google", { idToken });
      const { user: userData, tokens } = response.data.data;
      tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        googleAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
