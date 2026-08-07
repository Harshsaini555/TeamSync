import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { rateLimiter } from "../middlewares/rate-limiter.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema
} from "../validators/auth.validator";

const router = Router();

const authRateLimiter = rateLimiter(10, 15 * 60 * 1000); // 10 attempts per 15 min

router.post("/register", authRateLimiter, validateRequest(registerSchema), authController.register);
router.post("/login", authRateLimiter, validateRequest(loginSchema), authController.login);
router.post("/verify-email", validateRequest(verifyEmailSchema), authController.verifyEmail);
router.get("/verify-email", authController.verifyEmail);
router.post("/refresh", validateRequest(refreshTokenSchema), authController.refresh);
router.post("/forgot-password", authRateLimiter, validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authRateLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);
router.post("/google", validateRequest(googleAuthSchema), authController.googleAuth);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
