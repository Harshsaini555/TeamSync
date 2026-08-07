import { z } from "zod";
import { WorkspaceRole } from "../constants/enums";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50, "Workspace name cannot exceed 50 characters"),
  description: z.string().max(200, "Description cannot exceed 200 characters").optional()
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50, "Workspace name cannot exceed 50 characters").optional(),
  description: z.string().max(200, "Description cannot exceed 200 characters").optional()
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address format"),
  role: z.nativeEnum(WorkspaceRole).default(WorkspaceRole.MEMBER)
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(WorkspaceRole)
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invite token is required")
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
