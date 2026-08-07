import { Project, IProject } from "../models/project.model";
import mongoose from "mongoose";

export class ProjectRepository {
  public async create(projectData: Partial<IProject>): Promise<IProject> {
    const project = new Project(projectData);
    return project.save();
  }

  public async findById(id: string): Promise<IProject | null> {
    return Project.findById(id).populate("leadId", "name email avatarUrl").populate("members", "name email avatarUrl");
  }

  public async findByKey(workspaceId: string, key: string): Promise<IProject | null> {
    return Project.findOne({ workspaceId, key: key.toUpperCase().trim() })
      .populate("leadId", "name email avatarUrl")
      .populate("members", "name email avatarUrl");
  }

  public async findByWorkspaceId(workspaceId: string, includeArchived = false): Promise<IProject[]> {
    const query: any = { workspaceId };
    if (!includeArchived) {
      query.isArchived = false;
    }
    return Project.find(query)
      .populate("leadId", "name email avatarUrl")
      .populate("members", "name email avatarUrl")
      .sort({ updatedAt: -1 });
  }

  public async update(id: string, updateData: Partial<IProject>): Promise<IProject | null> {
    return Project.findByIdAndUpdate(id, updateData, { new: true })
      .populate("leadId", "name email avatarUrl")
      .populate("members", "name email avatarUrl");
  }

  public async delete(id: string): Promise<boolean> {
    const res = await Project.findByIdAndDelete(id);
    return !!res;
  }

  public async addMember(projectId: string, userId: string): Promise<IProject | null> {
    return Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate("members", "name email avatarUrl");
  }

  public async removeMember(projectId: string, userId: string): Promise<IProject | null> {
    return Project.findByIdAndUpdate(
      projectId,
      { $pull: { members: userId } },
      { new: true }
    ).populate("members", "name email avatarUrl");
  }
}

export const projectRepository = new ProjectRepository();
