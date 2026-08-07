import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { workspaceService } from "../services/workspace.service";
import { sendResponse } from "../utils/response";

export class WorkspaceController {
  public createWorkspace = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspace = await workspaceService.createWorkspace(req.user!.userId, req.body);
      sendResponse(res, 201, "Workspace created successfully", workspace);
    } catch (error) {
      next(error);
    }
  };

  public getUserWorkspaces = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaces = await workspaceService.getUserWorkspaces(req.user!.userId);
      sendResponse(res, 200, "User workspaces retrieved", workspaces);
    } catch (error) {
      next(error);
    }
  };

  public getWorkspaceById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await workspaceService.getWorkspaceById(req.params.workspaceId, req.user!.userId);
      sendResponse(res, 200, "Workspace details retrieved", data);
    } catch (error) {
      next(error);
    }
  };

  public updateWorkspace = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspace = await workspaceService.updateWorkspace(req.params.workspaceId, req.body);
      sendResponse(res, 200, "Workspace updated successfully", workspace);
    } catch (error) {
      next(error);
    }
  };

  public deleteWorkspace = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await workspaceService.deleteWorkspace(req.params.workspaceId, req.user!.userId);
      sendResponse(res, 200, "Workspace deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  public inviteMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invite = await workspaceService.inviteMember(req.params.workspaceId, req.user!.userId, req.body);
      sendResponse(res, 201, "Member invitation sent successfully", invite);
    } catch (error) {
      next(error);
    }
  };

  public acceptInvite = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await workspaceService.acceptInvite(req.user!.userId, req.body.token);
      sendResponse(res, 200, result.message, result.workspace);
    } catch (error) {
      next(error);
    }
  };

  public getMembers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const members = await workspaceService.getMembers(req.params.workspaceId);
      sendResponse(res, 200, "Workspace members retrieved", members);
    } catch (error) {
      next(error);
    }
  };

  public updateMemberRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await workspaceService.updateMemberRole(
        req.params.workspaceId,
        req.user!.userId,
        req.params.userId,
        req.body.role
      );
      sendResponse(res, 200, "Member role updated successfully", updated);
    } catch (error) {
      next(error);
    }
  };

  public removeMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await workspaceService.removeMember(req.params.workspaceId, req.user!.userId, req.params.userId);
      sendResponse(res, 200, "Member removed successfully");
    } catch (error) {
      next(error);
    }
  };
}

export const workspaceController = new WorkspaceController();
