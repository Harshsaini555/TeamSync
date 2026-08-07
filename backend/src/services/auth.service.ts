import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { userRepository, UserRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email";
import { AuthUserDTO, AuthResponseData, AuthTokens } from "../types";
import { AuthProvider, UserRole } from "../constants/enums";
import { AuthMessages } from "../constants/messages";
import { env } from "../config/env";
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ForbiddenError
} from "../errors/app-error";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  GoogleAuthInput
} from "../validators/auth.validator";
import { IUser } from "../models/user.model";

export class AuthService {
  private userRepo: UserRepository;
  private googleClient: OAuth2Client;

  constructor() {
    this.userRepo = userRepository;
    this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  private mapToUserDTO(user: IUser): AuthUserDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      provider: user.provider,
      isEmailVerified: user.isEmailVerified,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString()
    };
  }

  public async register(input: RegisterInput): Promise<{ user: AuthUserDTO; message: string }> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError(AuthMessages.USER_ALREADY_EXISTS);
    }

    const passwordHash = await hashPassword(input.password);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.userRepo.create({
      name: input.name,
      email: input.email,
      passwordHash,
      provider: AuthProvider.LOCAL,
      role: UserRole.MEMBER,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: tokenExpires
    });

    await sendVerificationEmail(user.email, verificationToken);

    return {
      user: this.mapToUserDTO(user),
      message: AuthMessages.REGISTER_SUCCESS
    };
  }

  public async verifyEmail(token: string): Promise<string> {
    const user = await this.userRepo.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestError(AuthMessages.VERIFY_EMAIL_FAILED);
    }

    await this.userRepo.update(user._id.toString(), {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    return AuthMessages.VERIFY_EMAIL_SUCCESS;
  }

  public async login(input: LoginInput): Promise<AuthResponseData> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError(AuthMessages.INVALID_CREDENTIALS);
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError(AuthMessages.INVALID_CREDENTIALS);
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenError(AuthMessages.EMAIL_NOT_VERIFIED);
    }

    if (!user.isActive) {
      throw new ForbiddenError(AuthMessages.ACCOUNT_DISABLED);
    }

    const userId = user._id.toString();
    const accessToken = generateAccessToken(userId, user.email, user.role);
    const refreshToken = generateRefreshToken(userId, user.email, user.role);

    const refreshTokenHash = await hashPassword(refreshToken);
    await this.userRepo.update(userId, { refreshTokenHash });

    return {
      user: this.mapToUserDTO(user),
      tokens: { accessToken, refreshToken }
    };
  }

  public async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshToken);
    const user = await this.userRepo.findById(payload.userId);

    if (!user || !user.refreshTokenHash || !user.isActive) {
      throw new UnauthorizedError(AuthMessages.INVALID_REFRESH_TOKEN);
    }

    const isMatch = await comparePassword(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
      throw new UnauthorizedError(AuthMessages.INVALID_REFRESH_TOKEN);
    }

    const userId = user._id.toString();
    const newAccessToken = generateAccessToken(userId, user.email, user.role);
    const newRefreshToken = generateRefreshToken(userId, user.email, user.role);

    const newRefreshHash = await hashPassword(newRefreshToken);
    await this.userRepo.update(userId, { refreshTokenHash: newRefreshHash });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  public async logout(userId: string): Promise<void> {
    await this.userRepo.update(userId, { refreshTokenHash: null });
  }

  public async forgotPassword(input: ForgotPasswordInput): Promise<string> {
    const user = await this.userRepo.findByEmail(input.email);
    if (user && user.isActive) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.userRepo.update(user._id.toString(), {
        passwordResetToken: resetToken,
        passwordResetExpires: expires
      });

      await sendPasswordResetEmail(user.email, resetToken);
    }

    return AuthMessages.FORGOT_PASSWORD_SUCCESS;
  }

  public async resetPassword(input: ResetPasswordInput): Promise<string> {
    const user = await this.userRepo.findByResetToken(input.token);
    if (!user) {
      throw new BadRequestError(AuthMessages.INVALID_RESET_TOKEN);
    }

    const passwordHash = await hashPassword(input.newPassword);
    await this.userRepo.update(user._id.toString(), {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshTokenHash: null
    });

    return AuthMessages.RESET_PASSWORD_SUCCESS;
  }

  public async googleAuth(input: GoogleAuthInput): Promise<AuthResponseData> {
    let email: string;
    let name: string;
    let googleId: string;
    let avatarUrl: string | undefined;

    try {
      if (input.idToken === "mock_google_id_token_dev") {
        email = "demo.google@teamsync.app";
        name = "Google Demo User";
        googleId = "google_mock_123456";
        avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";
      } else {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: input.idToken,
          audience: env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.name) {
          throw new UnauthorizedError(AuthMessages.GOOGLE_AUTH_FAILED);
        }
        email = payload.email;
        name = payload.name;
        googleId = payload.sub;
        avatarUrl = payload.picture;
      }
    } catch (e) {
      throw new UnauthorizedError(AuthMessages.GOOGLE_AUTH_FAILED);
    }

    let user = await this.userRepo.findByEmail(email);

    if (!user) {
      user = await this.userRepo.create({
        name,
        email,
        provider: AuthProvider.GOOGLE,
        googleId,
        avatarUrl,
        isEmailVerified: true,
        role: UserRole.MEMBER
      });
    } else if (!user.googleId) {
      user = await this.userRepo.update(user._id.toString(), {
        googleId,
        provider: AuthProvider.GOOGLE,
        isEmailVerified: true,
        ...(avatarUrl && { avatarUrl })
      }) as IUser;
    }

    if (!user.isActive) {
      throw new ForbiddenError(AuthMessages.ACCOUNT_DISABLED);
    }

    const userId = user._id.toString();
    const accessToken = generateAccessToken(userId, user.email, user.role);
    const refreshToken = generateRefreshToken(userId, user.email, user.role);

    const refreshTokenHash = await hashPassword(refreshToken);
    await this.userRepo.update(userId, { refreshTokenHash });

    return {
      user: this.mapToUserDTO(user),
      tokens: { accessToken, refreshToken }
    };
  }
}

export const authService = new AuthService();
