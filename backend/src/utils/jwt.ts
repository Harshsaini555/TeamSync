import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../types";
import { UserRole } from "../constants/enums";
import { UnauthorizedError } from "../errors/app-error";

export const generateAccessToken = (userId: string, email: string, role: UserRole): string => {
  const payload: JwtPayload = {
    userId,
    email,
    role,
    tokenType: "ACCESS"
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.Secret | number | string
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string, email: string, role: UserRole): string => {
  const payload: JwtPayload = {
    userId,
    email,
    role,
    tokenType: "REFRESH"
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.Secret | number | string
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (decoded.tokenType !== "ACCESS") {
      throw new UnauthorizedError("Invalid token type.");
    }
    return decoded;
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired access token.");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
    if (decoded.tokenType !== "REFRESH") {
      throw new UnauthorizedError("Invalid token type.");
    }
    return decoded;
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired refresh token.");
  }
};
