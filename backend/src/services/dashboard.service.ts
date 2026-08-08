import { dashboardRepository, DashboardRepository } from "../repositories/dashboard.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { NotFoundError } from "../errors/app-error";

export class DashboardService {
  private repo: DashboardRepository;

  constructor() {
    this.repo = dashboardRepository;
  }

  public async getWorkspaceDashboard(workspaceId: string) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }
    return this.repo.getDashboardData(workspaceId);
  }
}

export const dashboardService = new DashboardService();
