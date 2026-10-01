import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { sendResponse } from "../utils/response";
import { AuthenticatedRequest } from "../types";

export class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      sendResponse(res, 201, "Registration successful", result);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendResponse(res, 200, "Login successful", result);
    } catch (error) {
      next(error);
    }
  };

  public google = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idToken } = req.body;
      const result = await authService.googleAuth(idToken || "");
      sendResponse(res, 200, "Google authentication successful", result);
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      sendResponse(res, 200, "If an account with that email exists, a password reset link has been sent.");
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      sendResponse(res, 200, "Password reset successfully. You may now sign in.");
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      sendResponse(res, 200, "Tokens refreshed successfully", result);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.logout(req.user!.userId);
      sendResponse(res, 200, "Logout successful");
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);
      sendResponse(res, 200, "User profile fetched", user);
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await authService.updateProfile(req.user!.userId, req.body);
      sendResponse(res, 200, "Profile updated successfully", updated);
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      sendResponse(res, 200, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  };

  public updateNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prefs = await authService.updateNotificationPreferences(req.user!.userId, req.body);
      sendResponse(res, 200, "Notification preferences updated", prefs);
    } catch (error) {
      next(error);
    }
  };

  public deleteAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.deleteAccount(req.user!.userId);
      sendResponse(res, 200, "Account deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
