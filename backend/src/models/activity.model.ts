import mongoose, { Schema, Document } from "mongoose";

export enum ActivityAction {
  TASK_CREATED = "TASK_CREATED",
  STATUS_CHANGED = "STATUS_CHANGED",
  PRIORITY_CHANGED = "PRIORITY_CHANGED",
  ASSIGNEE_CHANGED = "ASSIGNEE_CHANGED",
  COMMENT_ADDED = "COMMENT_ADDED",
  TITLE_UPDATED = "TITLE_UPDATED",
  DESCRIPTION_UPDATED = "DESCRIPTION_UPDATED"
}

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: ActivityAction;
  details: string;
  createdAt: Date;
}

const ActivityLogSchema: Schema<IActivityLog> = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      enum: Object.values(ActivityAction),
      required: true
    },
    details: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
