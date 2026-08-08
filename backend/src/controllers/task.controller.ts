import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { taskService } from "../services/task.service";
import { sendResponse } from "../utils/response";

export class TaskController {
  public createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const task = await taskService.createTask(projectId, req.user!.userId, req.body);
      sendResponse(res, 201, "Task created successfully", task);
    } catch (error) {
      next(error);
    }
  };

  public getProjectTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        assigneeId: req.query.assigneeId as string,
        search: req.query.search as string
      };
      const tasks = await taskService.getProjectTasks(projectId, filters);
      sendResponse(res, 200, "Project tasks retrieved", tasks);
    } catch (error) {
      next(error);
    }
  };

  public getTaskById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await taskService.getTaskById(req.params.taskId);
      sendResponse(res, 200, "Task details retrieved", task);
    } catch (error) {
      next(error);
    }
  };

  public updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await taskService.updateTask(req.params.taskId, req.user!.userId, req.body);
      sendResponse(res, 200, "Task updated successfully", task);
    } catch (error) {
      next(error);
    }
  };

  public deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await taskService.deleteTask(req.params.taskId);
      sendResponse(res, 200, "Task deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  public addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await taskService.addComment(req.params.taskId, req.user!.userId, req.body.content);
      sendResponse(res, 201, "Comment added successfully", comment);
    } catch (error) {
      next(error);
    }
  };

  public getComments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comments = await taskService.getComments(req.params.taskId);
      sendResponse(res, 200, "Task comments retrieved", comments);
    } catch (error) {
      next(error);
    }
  };

  public getActivities = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activities = await taskService.getActivities(req.params.taskId);
      sendResponse(res, 200, "Task activity log retrieved", activities);
    } catch (error) {
      next(error);
    }
  };
}

export const taskController = new TaskController();
