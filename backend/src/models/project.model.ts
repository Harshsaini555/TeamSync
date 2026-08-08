import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  key: string;
  description?: string;
  color?: string;
  leadId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: "#3b82f6"
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

ProjectSchema.index({ workspaceId: 1, key: 1 }, { unique: true });
ProjectSchema.index(
  { name: "text", key: "text", description: "text" },
  { weights: { key: 10, name: 5, description: 1 } }
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
