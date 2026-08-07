import mongoose, { Schema, Document } from "mongoose";
import { WorkspaceRole } from "../constants/enums";

export interface IWorkspaceMember extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: WorkspaceRole;
  joinedAt: Date;
}

const WorkspaceMemberSchema: Schema<IWorkspaceMember> = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: Object.values(WorkspaceRole),
      default: WorkspaceRole.MEMBER,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export const WorkspaceMember = mongoose.model<IWorkspaceMember>("WorkspaceMember", WorkspaceMemberSchema);
