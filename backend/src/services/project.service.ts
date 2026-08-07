import { projectRepository, ProjectRepository } from "../repositories/project.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { CreateProjectInput, UpdateProjectInput } from "../validators/project.validator";
import { NotFoundError, ConflictError } from "../errors/app-error";
import mongoose from "mongoose";

export class ProjectService {
  private repo: ProjectRepository;

  constructor() {
    this.repo = projectRepository;
  }

  public async createProject(workspaceId: string, userId: string, input: CreateProjectInput) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const uppercaseKey = input.key.toUpperCase().trim();
    const existing = await this.repo.findByKey(workspaceId, uppercaseKey);
    if (existing) {
      throw new ConflictError(`Project key '${uppercaseKey}' already exists in this workspace.`);
    }

    const leadId = input.leadId || userId;

    return this.repo.create({
      workspaceId: new mongoose.Types.ObjectId(workspaceId) as any,
      name: input.name,
      key: uppercaseKey,
      description: input.description || "",
      color: input.color || "#3b82f6",
      leadId: new mongoose.Types.ObjectId(leadId) as any,
      members: [new mongoose.Types.ObjectId(leadId) as any],
      isArchived: false
    });
  }

  public async getWorkspaceProjects(workspaceId: string, includeArchived = false) {
    return this.repo.findByWorkspaceId(workspaceId, includeArchived);
  }

  public async getProjectById(projectId: string) {
    const project = await this.repo.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    return project;
  }

  public async getProjectByKey(workspaceId: string, key: string) {
    const project = await this.repo.findByKey(workspaceId, key);
    if (!project) {
      throw new NotFoundError(`Project '${key.toUpperCase()}' not found`);
    }
    return project;
  }

  public async updateProject(projectId: string, input: UpdateProjectInput) {
    const updateData: any = { ...input };
    if (input.leadId) {
      updateData.leadId = new mongoose.Types.ObjectId(input.leadId);
    }
    const project = await this.repo.update(projectId, updateData);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    return project;
  }

  public async archiveProject(projectId: string, isArchived: boolean) {
    const project = await this.repo.update(projectId, { isArchived });
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    return project;
  }

  public async deleteProject(projectId: string) {
    const project = await this.repo.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    return this.repo.delete(projectId);
  }

  public async addMember(projectId: string, userId: string) {
    const project = await this.repo.addMember(projectId, userId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    return project;
  }

  public async removeMember(projectId: string, userId: string) {
    const project = await this.repo.removeMember(projectId, userId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    return project;
  }
}

export const projectService = new ProjectService();
