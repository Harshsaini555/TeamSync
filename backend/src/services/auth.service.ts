import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userRepository, UserRepository } from "../repositories/user.repository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../errors/app-error";
import { UserRole } from "../constants/enums";
import { sendPasswordResetEmail } from "../utils/email";

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = userRepository;
  }

  public async register(name: string, email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await this.userRepo.findByEmail(cleanEmail);
    if (existingUser) {
      throw new BadRequestError("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userRepo.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash
    });

    const accessToken = generateAccessToken(user._id.toString(), user.email, UserRole.MEMBER);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email, UserRole.MEMBER);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(user._id.toString(), { refreshTokenHash });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        notificationPreferences: user.notificationPreferences
      },
      accessToken,
      refreshToken
    };
  }

  public async login(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      throw new UnauthorizedError("No user found with this email address. Please register first.");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError("This account was created with Google OAuth. Please sign in with Google.");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Incorrect password. Please try again.");
    }

    const accessToken = generateAccessToken(user._id.toString(), user.email, UserRole.MEMBER);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email, UserRole.MEMBER);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(user._id.toString(), { refreshTokenHash });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        notificationPreferences: user.notificationPreferences
      },
      accessToken,
      refreshToken
    };
  }

  public async googleAuth(idToken: string) {
    const mockEmail = "developer@teamsync.app";
    let user = await this.userRepo.findByEmail(mockEmail);
    if (!user) {
      user = await this.userRepo.create({
        name: "Developer User",
        email: mockEmail,
        googleId: "mock_google_id_123"
      });
    }

    const accessToken = generateAccessToken(user._id.toString(), user.email, UserRole.MEMBER);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email, UserRole.MEMBER);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(user._id.toString(), { refreshTokenHash });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        notificationPreferences: user.notificationPreferences
      },
      accessToken,
      refreshToken
    };
  }

  public async forgotPassword(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);
    return true;
  }

  public async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepo.findByResetToken(token);
    if (!user) {
      throw new BadRequestError("Invalid or expired password reset token");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return true;
  }

  public async refreshTokens(token: string) {
    const decoded = verifyRefreshToken(token);
    const user = await this.userRepo.findById(decoded.userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const isMatch = await bcrypt.compare(token, user.refreshTokenHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.email, decoded.role || UserRole.MEMBER);
    const newRefreshToken = generateRefreshToken(user._id.toString(), user.email, decoded.role || UserRole.MEMBER);

    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepo.update(user._id.toString(), { refreshTokenHash: newRefreshTokenHash });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  public async logout(userId: string) {
    await this.userRepo.update(userId, { refreshTokenHash: null as any });
    return true;
  }

  public async updateProfile(userId: string, data: { name?: string; avatarUrl?: string; bio?: string }) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (data.name !== undefined) user.name = data.name;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    if (data.bio !== undefined) user.bio = data.bio;

    await user.save();
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      notificationPreferences: user.notificationPreferences
    };
  }

  public async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.passwordHash) {
      throw new BadRequestError("Cannot change password for OAuth account");
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError("Incorrect current password");
    }

    user.passwordHash = await bcrypt.hash(newPass, 10);
    await user.save();
    return true;
  }

  public async updateNotificationPreferences(userId: string, prefs: any) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...prefs
    };

    await user.save();
    return user.notificationPreferences;
  }

  public async deleteAccount(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    await this.userRepo.delete(userId);
    return true;
  }

  public async getCurrentUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      notificationPreferences: user.notificationPreferences
    };
  }
}

export const authService = new AuthService();
