import mongoose, { Schema, Document } from "mongoose";
import { WorkspaceRole, InviteStatus } from "../constants/enums";

export interface IWorkspaceInvite extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  email: string;
  role: WorkspaceRole;
  token: string;
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  status: InviteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceInviteSchema: Schema<IWorkspaceInvite> = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    role: {
      type: String,
      enum: Object.values(WorkspaceRole),
      default: WorkspaceRole.MEMBER
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(InviteStatus),
      default: InviteStatus.PENDING
    }
  },
  {
    timestamps: true
  }
);

export const WorkspaceInvite = mongoose.model<IWorkspaceInvite>("WorkspaceInvite", WorkspaceInviteSchema);
