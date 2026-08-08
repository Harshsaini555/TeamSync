import mongoose, { Schema, Document } from "mongoose";

export interface INotificationPreferences {
  emailAlerts: boolean;
  taskAssigned: boolean;
  commentMentions: boolean;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatarUrl?: string;
  bio?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokenHash?: string;
  notificationPreferences: INotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: false
    },
    googleId: {
      type: String,
      required: false,
      sparse: true
    },
    avatarUrl: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: ""
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      required: false
    },
    emailVerificationExpires: {
      type: Date,
      required: false
    },
    passwordResetToken: {
      type: String,
      required: false
    },
    passwordResetExpires: {
      type: Date,
      required: false
    },
    refreshTokenHash: {
      type: String,
      required: false
    },
    notificationPreferences: {
      emailAlerts: { type: Boolean, default: true },
      taskAssigned: { type: Boolean, default: true },
      commentMentions: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

UserSchema.index({ name: "text", email: "text" });

export const User = mongoose.model<IUser>("User", UserSchema);
