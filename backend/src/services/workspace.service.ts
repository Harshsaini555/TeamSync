import crypto from "crypto";
import { workspaceRepository, WorkspaceRepository } from "../repositories/workspace.repository";
import { userRepository } from "../repositories/user.repository";
import { WorkspaceRole, InviteStatus } from "../constants/enums";
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from "../errors/app-error";
import { CreateWorkspaceInput, UpdateWorkspaceInput, InviteMemberInput } from "../validators/workspace.validator";
import { env } from "../config/env";
import nodemailer from "nodemailer";

export class WorkspaceService {
  private repo: WorkspaceRepository;

  constructor() {
    this.repo = workspaceRepository;
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  public async createWorkspace(userId: string, input: CreateWorkspaceInput) {
    const slug = this.generateSlug(input.name);
    return this.repo.createWorkspace(input.name, slug, userId, input.description);
  }

  public async getUserWorkspaces(userId: string) {
    return this.repo.getUserWorkspaces(userId);
  }

  public async getWorkspaceById(workspaceId: string, userId: string) {
    const workspace = await this.repo.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }
    const member = await this.repo.findMember(workspaceId, userId);
    if (!member) {
      throw new ForbiddenError("You are not a member of this workspace");
    }
    return { workspace, role: member.role };
  }

  public async updateWorkspace(workspaceId: string, input: UpdateWorkspaceInput) {
    const workspace = await this.repo.updateWorkspace(workspaceId, input);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }
    return workspace;
  }

  public async deleteWorkspace(workspaceId: string, requesterUserId: string) {
    const member = await this.repo.findMember(workspaceId, requesterUserId);
    if (!member || member.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenError("Only the workspace Owner can delete this workspace.");
    }
    return this.repo.deleteWorkspace(workspaceId);
  }

  public async inviteMember(workspaceId: string, requesterUserId: string, input: InviteMemberInput) {
    const workspace = await this.repo.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const invitedUser = await userRepository.findByEmail(input.email);
    if (invitedUser) {
      const existingMember = await this.repo.findMember(workspaceId, invitedUser._id.toString());
      if (existingMember) {
        throw new ConflictError("User is already a member of this workspace.");
      }
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await this.repo.createInvite({
      workspaceId: workspace._id,
      email: input.email.toLowerCase().trim(),
      role: input.role,
      token,
      invitedBy: requesterUserId as any,
      expiresAt,
      status: InviteStatus.PENDING
    });

    const inviteUrl = `${env.CLIENT_URL}/workspaces/accept-invite?token=${token}`;

    try {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT, 10),
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
      });

      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: input.email,
        subject: `Invitation to join ${workspace.name} on TeamSync`,
        html: `
          <div style="font-family: sans-serif; background-color: #0b0f17; color: #f1f5f9; padding: 40px 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: #161b26; border: 1px solid #262d3d; border-radius: 8px; padding: 32px;">
              <h2 style="color: #38bdf8; margin-top: 0;">Workspace Invitation</h2>
              <p style="color: #94a3b8;">You have been invited to join the <strong>${workspace.name}</strong> workspace as a <strong>${input.role}</strong>.</p>
              <div style="margin: 28px 0;">
                <a href="${inviteUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Accept Invitation</a>
              </div>
            </div>
          </div>
        `
      });
    } catch (e) {
      console.warn(`⚠️ Invite email sending skipped in dev mode (Token: ${token})`);
    }

    return invite;
  }

  public async acceptInvite(userId: string, token: string) {
    const invite = await this.repo.findInviteByToken(token);
    if (!invite) {
      throw new BadRequestError("Invalid or expired workspace invitation token.");
    }

    const existingMember = await this.repo.findMember(invite.workspaceId.toString(), userId);
    if (existingMember) {
      await this.repo.updateInviteStatus(invite._id.toString(), InviteStatus.ACCEPTED);
      return { message: "You are already a member of this workspace." };
    }

    await this.repo.addMember(invite.workspaceId.toString(), userId, invite.role);
    await this.repo.updateInviteStatus(invite._id.toString(), InviteStatus.ACCEPTED);

    const workspace = await this.repo.findById(invite.workspaceId.toString());
    return { message: "Invitation accepted successfully", workspace };
  }

  public async getMembers(workspaceId: string) {
    return this.repo.getMembers(workspaceId);
  }

  public async updateMemberRole(workspaceId: string, requesterUserId: string, targetUserId: string, newRole: WorkspaceRole) {
    const requesterMember = await this.repo.findMember(workspaceId, requesterUserId);
    const targetMember = await this.repo.findMember(workspaceId, targetUserId);

    if (!requesterMember || !targetMember) {
      throw new NotFoundError("Member record not found");
    }

    if (targetMember.role === WorkspaceRole.OWNER) {
      throw new ForbiddenError("Cannot change role of the workspace Owner.");
    }

    if (requesterMember.role === WorkspaceRole.ADMIN && targetMember.role === WorkspaceRole.ADMIN) {
      throw new ForbiddenError("Admins cannot modify another Admin's role.");
    }

    return this.repo.updateMemberRole(workspaceId, targetUserId, newRole);
  }

  public async removeMember(workspaceId: string, requesterUserId: string, targetUserId: string) {
    const requesterMember = await this.repo.findMember(workspaceId, requesterUserId);
    const targetMember = await this.repo.findMember(workspaceId, targetUserId);

    if (!requesterMember || !targetMember) {
      throw new NotFoundError("Member record not found");
    }

    if (targetMember.role === WorkspaceRole.OWNER) {
      throw new ForbiddenError("Workspace Owner cannot be removed.");
    }

    // Leave workspace case
    if (requesterUserId === targetUserId) {
      return this.repo.removeMember(workspaceId, targetUserId);
    }

    if (requesterMember.role !== WorkspaceRole.OWNER && requesterMember.role !== WorkspaceRole.ADMIN) {
      throw new ForbiddenError("Insufficient permissions to remove members.");
    }

    if (requesterMember.role === WorkspaceRole.ADMIN && targetMember.role === WorkspaceRole.ADMIN) {
      throw new ForbiddenError("Admins cannot remove other Admins.");
    }

    return this.repo.removeMember(workspaceId, targetUserId);
  }
}

export const workspaceService = new WorkspaceService();
