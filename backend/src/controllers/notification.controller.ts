import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { notificationService } from "../services/notification.service";
import { sendResponse } from "../utils/response";

export class NotificationController {
  public getUserNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notifications = await notificationService.getUserNotifications(req.user!.userId);
      sendResponse(res, 200, "Notifications retrieved", notifications);
    } catch (error) {
      next(error);
    }
  };

  public getUnreadCount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);
      sendResponse(res, 200, "Unread count retrieved", { count });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await notificationService.markAsRead(req.params.notificationId, req.user!.userId);
      sendResponse(res, 200, "Notification marked as read", updated);
    } catch (error) {
      next(error);
    }
  };

  public markAllAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      sendResponse(res, 200, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
