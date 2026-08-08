import { Router } from "express";
import { workspaceController } from "../controllers/workspace.controller";
import { dashboardController } from "../controllers/dashboard.controller";
import { workspaceProjectRouter } from "./project.routes";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceRole } from "../middlewares/rbac.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { WorkspaceRole } from "../constants/enums";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  acceptInviteSchema
} from "../validators/workspace.validator";

const router = Router();

router.use(authenticate);

router.post("/", validateRequest(createWorkspaceSchema), workspaceController.createWorkspace);
router.get("/", workspaceController.getUserWorkspaces);
router.post("/accept-invite", validateRequest(acceptInviteSchema), workspaceController.acceptInvite);

router.get("/:workspaceId", requireWorkspaceRole(WorkspaceRole.GUEST), workspaceController.getWorkspaceById);
router.get("/:workspaceId/dashboard", requireWorkspaceRole(WorkspaceRole.GUEST), dashboardController.getWorkspaceDashboard);
router.patch(
  "/:workspaceId",
  requireWorkspaceRole(WorkspaceRole.ADMIN),
  validateRequest(updateWorkspaceSchema),
  workspaceController.updateWorkspace
);
router.delete("/:workspaceId", requireWorkspaceRole(WorkspaceRole.OWNER), workspaceController.deleteWorkspace);

// Mount workspace project routes
router.use("/:workspaceId/projects", workspaceProjectRouter);

// Members and Invites
router.get("/:workspaceId/members", requireWorkspaceRole(WorkspaceRole.GUEST), workspaceController.getMembers);
router.post(
  "/:workspaceId/invites",
  requireWorkspaceRole(WorkspaceRole.ADMIN),
  validateRequest(inviteMemberSchema),
  workspaceController.inviteMember
);
router.patch(
  "/:workspaceId/members/:userId",
  requireWorkspaceRole(WorkspaceRole.ADMIN),
  validateRequest(updateMemberRoleSchema),
  workspaceController.updateMemberRole
);
router.delete("/:workspaceId/members/:userId", requireWorkspaceRole(WorkspaceRole.MEMBER), workspaceController.removeMember);

export default router;
