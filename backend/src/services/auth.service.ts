import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userRepository, UserRepository } from "../repositories/user.repository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../errors/app-error";
import { UserRole } from "../constants/enums";
import { env } from "../config/env";

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = userRepository;
  }

  public async register(name: string, email: string, password: string) {
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await this.userRepo.create({
      name,
      email,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires
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
        isEmailVerified: user.isEmailVerified,
        notificationPreferences: user.notificationPreferences
      },
      accessToken,
      refreshToken
    };
  }

  public async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
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
        isEmailVerified: user.isEmailVerified,
        notificationPreferences: user.notificationPreferences
      },
      accessToken,
      refreshToken
    };
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
      isEmailVerified: user.isEmailVerified,
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
      isEmailVerified: user.isEmailVerified,
      notificationPreferences: user.notificationPreferences
    };
  }
}

export const authService = new AuthService();
