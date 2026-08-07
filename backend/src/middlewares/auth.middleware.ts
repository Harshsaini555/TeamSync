import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../types";
import { UnauthorizedError, ForbiddenError } from "../errors/app-error";
import { AuthMessages } from "../constants/messages";
import { UserRole } from "../constants/enums";

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(AuthMessages.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError(AuthMessages.UNAUTHORIZED);
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError(AuthMessages.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(AuthMessages.FORBIDDEN));
    }

    next();
  };
};
