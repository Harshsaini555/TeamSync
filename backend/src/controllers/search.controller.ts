import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { searchService } from "../services/search.service";
import { sendResponse } from "../utils/response";

export class SearchController {
  public searchGlobal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId;
      const options = {
        q: (req.query.q as string) || "",
        type: (req.query.type as any) || "all",
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10
      };

      const result = await searchService.searchGlobal(workspaceId, options);
      sendResponse(res, 200, "Search results retrieved", result);
    } catch (error) {
      next(error);
    }
  };
}

export const searchController = new SearchController();
