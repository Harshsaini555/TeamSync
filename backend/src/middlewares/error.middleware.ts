import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../errors/app-error";
import { sendResponse } from "../utils/response";
import { env } from "../config/env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof ValidationError) {
    return sendResponse(res, err.statusCode, err.message, undefined, err.errors);
  }

  if (err instanceof AppError) {
    return sendResponse(res, err.statusCode, err.message);
  }

  console.error("🔥 Unhandled Server Exception:", err);

  const message = env.NODE_ENV === "production" ? "Internal server error" : err.message;
  return sendResponse(res, 500, message);
};
