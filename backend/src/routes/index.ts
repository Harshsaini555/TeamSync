import { Router } from "express";
import authRoutes from "./auth.routes";
import workspaceRoutes from "./workspace.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
