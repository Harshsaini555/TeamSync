import mongoose, { Schema, Document } from "mongoose";
import { TaskStatus, TaskPriority } from "../constants/enums";

export interface IChecklistItem {
  _id?: mongoose.Types.ObjectId;
  title: string;
  isCompleted: boolean;
}

export interface ISubtaskItem {
  _id?: mongoose.Types.ObjectId;
  title: string;
  status: TaskStatus;
  assigneeId?: mongoose.Types.ObjectId;
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  taskNumber: number;
  taskKey: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  assigneeId?: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  dueDate?: Date;
  estimatedTime?: number;
  position: number;
  checklist: IChecklistItem[];
  subtasks: ISubtaskItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema({
  title: { type: String, required: true, trim: true },
  isCompleted: { type: Boolean, default: false }
});

const SubtaskItemSchema = new Schema({
  title: { type: String, required: true, trim: true },
  status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.TODO },
  assigneeId: { type: Schema.Types.ObjectId, ref: "User" }
});

const TaskSchema: Schema<ITask> = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    taskNumber: {
      type: Number,
      required: true
    },
    taskKey: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
      index: true
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
      index: true
    },
    labels: [
      {
        type: String,
        trim: true
      }
    ],
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    dueDate: {
      type: Date,
      default: null
    },
    estimatedTime: {
      type: Number,
      default: 0
    },
    position: {
      type: Number,
      default: 65535
    },
    checklist: [ChecklistItemSchema],
    subtasks: [SubtaskItemSchema]
  },
  {
    timestamps: true
  }
);

TaskSchema.index({ projectId: 1, taskNumber: 1 }, { unique: true });
TaskSchema.index(
  { title: "text", description: "text", taskKey: "text", labels: "text" },
  { weights: { taskKey: 10, title: 5, labels: 3, description: 1 } }
);

export const Task = mongoose.model<ITask>("Task", TaskSchema);
