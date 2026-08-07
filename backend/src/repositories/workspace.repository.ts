import { Workspace, IWorkspace } from "../models/workspace.model";
import { WorkspaceMember, IWorkspaceMember } from "../models/workspace-member.model";
import { WorkspaceInvite, IWorkspaceInvite } from "../models/workspace-invite.model";
import { WorkspaceRole, InviteStatus } from "../constants/enums";
import mongoose from "mongoose";

export class WorkspaceRepository {
  public async createWorkspace(name: string, slug: string, ownerId: string, description?: string): Promise<IWorkspace> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const workspace = new Workspace({
        name,
        slug,
        ownerId,
        description: description || ""
      });
      await workspace.save({ session });

      const member = new WorkspaceMember({
        workspaceId: workspace._id,
        userId: ownerId,
        role: WorkspaceRole.OWNER
      });
      await member.save({ session });

      await session.commitTransaction();
      session.endSession();
      return workspace;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  public async findById(workspaceId: string): Promise<IWorkspace | null> {
    return Workspace.findById(workspaceId);
  }

  public async findBySlug(slug: string): Promise<IWorkspace | null> {
    return Workspace.findOne({ slug: slug.toLowerCase().trim() });
  }

  public async getUserWorkspaces(userId: string): Promise<Array<{ workspace: IWorkspace; role: WorkspaceRole }>> {
    const members = await WorkspaceMember.find({ userId }).populate<{ workspaceId: IWorkspace }>("workspaceId");
    return members
      .filter((m) => m.workspaceId !== null)
      .map((m) => ({
        workspace: m.workspaceId,
        role: m.role
      }));
  }

  public async findMember(workspaceId: string, userId: string): Promise<IWorkspaceMember | null> {
    return WorkspaceMember.findOne({ workspaceId, userId });
  }

  public async getMembers(workspaceId: string): Promise<any[]> {
    return WorkspaceMember.find({ workspaceId }).populate("userId", "name email avatarUrl role createdAt");
  }

  public async addMember(workspaceId: string, userId: string, role: WorkspaceRole): Promise<IWorkspaceMember> {
    const member = new WorkspaceMember({
      workspaceId,
      userId,
      role
    });
    return member.save();
  }

  public async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<IWorkspaceMember | null> {
    return WorkspaceMember.findOneAndUpdate(
      { workspaceId, userId },
      { role },
      { new: true }
    );
  }

  public async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    const res = await WorkspaceMember.findOneAndDelete({ workspaceId, userId });
    return !!res;
  }

  public async updateWorkspace(workspaceId: string, updateData: Partial<IWorkspace>): Promise<IWorkspace | null> {
    return Workspace.findByIdAndUpdate(workspaceId, updateData, { new: true });
  }

  public async deleteWorkspace(workspaceId: string): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Workspace.findByIdAndDelete(workspaceId, { session });
      await WorkspaceMember.deleteMany({ workspaceId }, { session });
      await WorkspaceInvite.deleteMany({ workspaceId }, { session });

      await session.commitTransaction();
      session.endSession();
      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  public async createInvite(inviteData: Partial<IWorkspaceInvite>): Promise<IWorkspaceInvite> {
    const invite = new WorkspaceInvite(inviteData);
    return invite.save();
  }

  public async findInviteByToken(token: string): Promise<IWorkspaceInvite | null> {
    return WorkspaceInvite.findOne({
      token,
      status: InviteStatus.PENDING,
      expiresAt: { $gt: new Date() }
    });
  }

  public async updateInviteStatus(inviteId: string, status: InviteStatus): Promise<IWorkspaceInvite | null> {
    return WorkspaceInvite.findByIdAndUpdate(inviteId, { status }, { new: true });
  }
}

export const workspaceRepository = new WorkspaceRepository();
