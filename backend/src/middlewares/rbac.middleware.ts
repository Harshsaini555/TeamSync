import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { workspaceRepository } from "../repositories/workspace.repository";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "../errors/app-error";
import { WorkspaceRole } from "../constants/enums";

const roleHierarchy: Record<WorkspaceRole, number> = {
  [WorkspaceRole.OWNER]: 4,
  [WorkspaceRole.ADMIN]: 3,
  [WorkspaceRole.MEMBER]: 2,
  [WorkspaceRole.GUEST]: 1
};

export const requireWorkspaceRole = (requiredRole: WorkspaceRole) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        return next(new UnauthorizedError("Authentication required"));
      }

      const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
      if (!workspaceId) {
        return next(new ForbiddenError("Workspace ID parameter is missing"));
      }

      const member = await workspaceRepository.findMember(workspaceId as string, req.user.userId);
      if (!member) {
        return next(new ForbiddenError("Access denied. You are not a member of this workspace."));
      }

      const userRoleLevel = roleHierarchy[member.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        return next(
          new ForbiddenError(`Forbidden. Action requires minimum ${requiredRole} role in this workspace.`)
        );
      }

      // Attach workspace role to request object
      (req as any).workspaceRole = member.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
