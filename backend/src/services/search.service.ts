import { searchRepository, SearchRepository, SearchOptions } from "../repositories/search.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { NotFoundError } from "../errors/app-error";

export class SearchService {
  private repo: SearchRepository;

  constructor() {
    this.repo = searchRepository;
  }

  public async searchGlobal(workspaceId: string, options: SearchOptions) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    if (!options.q || options.q.trim().length < 2) {
      return {
        results: { tasks: [], projects: [], users: [], comments: [] },
        pagination: { page: 1, limit: 10, total: 0, hasNextPage: false }
      };
    }

    return this.repo.searchAll(workspaceId, options);
  }
}

export const searchService = new SearchService();
