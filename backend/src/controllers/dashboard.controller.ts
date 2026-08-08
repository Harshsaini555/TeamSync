import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { dashboardService } from "../services/dashboard.service";
import { sendResponse } from "../utils/response";

export class DashboardController {
  public getWorkspaceDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId;
      const data = await dashboardService.getWorkspaceDashboard(workspaceId);
      sendResponse(res, 200, "Workspace dashboard analytics retrieved", data);
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
