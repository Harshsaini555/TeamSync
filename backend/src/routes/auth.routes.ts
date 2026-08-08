import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateNotificationsSchema
} from "../validators/auth.validator";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/refresh", validateRequest(refreshTokenSchema), authController.refresh);

router.use(authenticate);
router.post("/logout", authController.logout);
router.get("/me", authController.me);
router.patch("/me/profile", validateRequest(updateProfileSchema), authController.updateProfile);
router.patch("/me/password", validateRequest(changePasswordSchema), authController.changePassword);
router.patch("/me/notifications", validateRequest(updateNotificationsSchema), authController.updateNotifications);
router.delete("/me", authController.deleteAccount);

export default router;
