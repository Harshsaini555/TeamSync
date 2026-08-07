import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { projectService } from "../services/project.service";
import { sendResponse } from "../utils/response";

export class ProjectController {
  public createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId;
      const project = await projectService.createProject(workspaceId, req.user!.userId, req.body);
      sendResponse(res, 201, "Project created successfully", project);
    } catch (error) {
      next(error);
    }
  };

  public getWorkspaceProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId;
      const includeArchived = req.query.includeArchived === "true";
      const projects = await projectService.getWorkspaceProjects(workspaceId, includeArchived);
      sendResponse(res, 200, "Workspace projects retrieved", projects);
    } catch (error) {
      next(error);
    }
  };

  public getProjectById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await projectService.getProjectById(req.params.projectId);
      sendResponse(res, 200, "Project details retrieved", project);
    } catch (error) {
      next(error);
    }
  };

  public updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await projectService.updateProject(req.params.projectId, req.body);
      sendResponse(res, 200, "Project updated successfully", project);
    } catch (error) {
      next(error);
    }
  };

  public toggleArchive = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isArchived = req.body.isArchived !== false;
      const project = await projectService.archiveProject(req.params.projectId, isArchived);
      const message = isArchived ? "Project archived successfully" : "Project restored successfully";
      sendResponse(res, 200, message, project);
    } catch (error) {
      next(error);
    }
  };

  public deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await projectService.deleteProject(req.params.projectId);
      sendResponse(res, 200, "Project deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  public addMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await projectService.addMember(req.params.projectId, req.body.userId);
      sendResponse(res, 200, "Member added to project successfully", project);
    } catch (error) {
      next(error);
    }
  };

  public removeMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await projectService.removeMember(req.params.projectId, req.params.userId);
      sendResponse(res, 200, "Member removed from project successfully", project);
    } catch (error) {
      next(error);
    }
  };
}

export const projectController = new ProjectController();
