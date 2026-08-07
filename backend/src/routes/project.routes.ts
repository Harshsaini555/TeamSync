import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceRole } from "../middlewares/rbac.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { WorkspaceRole } from "../constants/enums";
import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema
} from "../validators/project.validator";

export const workspaceProjectRouter = Router({ mergeParams: true });
export const projectRouter = Router();

// Routes under /api/v1/workspaces/:workspaceId/projects
workspaceProjectRouter.use(authenticate);
workspaceProjectRouter.post(
  "/",
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  validateRequest(createProjectSchema),
  projectController.createProject
);
workspaceProjectRouter.get(
  "/",
  requireWorkspaceRole(WorkspaceRole.GUEST),
  projectController.getWorkspaceProjects
);

// Direct routes under /api/v1/projects
projectRouter.use(authenticate);
projectRouter.get("/:projectId", projectController.getProjectById);
projectRouter.patch("/:projectId", validateRequest(updateProjectSchema), projectController.updateProject);
projectRouter.patch("/:projectId/archive", projectController.toggleArchive);
projectRouter.delete("/:projectId", projectController.deleteProject);

// Member management
projectRouter.post("/:projectId/members", validateRequest(addProjectMemberSchema), projectController.addMember);
projectRouter.delete("/:projectId/members/:userId", projectController.removeMember);
