import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { sendResponse } from "../utils/response";
import { AuthenticatedRequest } from "../types";
import { userRepository } from "../repositories/user.repository";
import { NotFoundError } from "../errors/app-error";

export class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.register(req.body);
      sendResponse(res, 201, result.message, result.user);
    } catch (error) {
      next(error);
    }
  };

  public verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = (req.query.token as string) || req.body.token;
      const message = await authService.verifyEmail(token);
      sendResponse(res, 200, message);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.login(req.body);
      sendResponse(res, 200, "Login successful", data);
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refresh(refreshToken);
      sendResponse(res, 200, "Token refreshed", tokens);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.userId) {
        await authService.logout(req.user.userId);
      }
      sendResponse(res, 200, "Logout successful");
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const message = await authService.forgotPassword(req.body);
      sendResponse(res, 200, message);
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const message = await authService.resetPassword(req.body);
      sendResponse(res, 200, message);
    } catch (error) {
      next(error);
    }
  };

  public googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.googleAuth(req.body);
      sendResponse(res, 200, "Google authentication successful", data);
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new NotFoundError("User not found");
      }
      const user = await userRepository.findById(req.user.userId);
      if (!user) {
        throw new NotFoundError("User account not found");
      }
      sendResponse(res, 200, "User profile retrieved", user);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
