import mongoose, { Schema, Document } from "mongoose";
import { WorkspacePlan } from "../constants/enums";

export interface IWorkspace extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  ownerId: mongoose.Types.ObjectId;
  plan: WorkspacePlan;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema: Schema<IWorkspace> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ""
    },
    logoUrl: {
      type: String,
      default: ""
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    plan: {
      type: String,
      enum: Object.values(WorkspacePlan),
      default: WorkspacePlan.FREE
    }
  },
  {
    timestamps: true
  }
);

export const Workspace = mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);
