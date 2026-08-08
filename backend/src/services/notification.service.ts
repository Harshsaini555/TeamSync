import { Notification, INotification, NotificationType } from "../models/notification.model";
import { socketService } from "./socket.service";
import mongoose from "mongoose";

export class NotificationService {
  public async createNotification(
    senderId: string,
    recipientId: string,
    type: NotificationType,
    title: string,
    message: string,
    linkUrl = ""
  ): Promise<INotification | null> {
    if (senderId === recipientId) return null; // Don't notify self

    const notification = new Notification({
      senderId: new mongoose.Types.ObjectId(senderId),
      recipientId: new mongoose.Types.ObjectId(recipientId),
      type,
      title,
      message,
      linkUrl,
      isRead: false
    });

    await notification.save();
    const populated = await Notification.findById(notification._id).populate("senderId", "name email avatarUrl");

    // Realtime Socket Emission to specific user room
    if (populated) {
      socketService.emitToUser(recipientId, "NOTIFICATION_RECEIVED", populated);
    }

    return populated;
  }

  public async getUserNotifications(recipientId: string): Promise<INotification[]> {
    return Notification.find({ recipientId })
      .populate("senderId", "name email avatarUrl")
      .sort({ createdAt: -1 })
      .limit(50);
  }

  public async getUnreadCount(recipientId: string): Promise<number> {
    return Notification.countDocuments({ recipientId, isRead: false });
  }

  public async markAsRead(notificationId: string, recipientId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipientId },
      { isRead: true },
      { new: true }
    );
  }

  public async markAllAsRead(recipientId: string): Promise<boolean> {
    await Notification.updateMany({ recipientId, isRead: false }, { isRead: true });
    return true;
  }
}

export const notificationService = new NotificationService();
