export enum WorkspaceRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  GUEST = "GUEST"
}

export enum WorkspacePlan {
  FREE = "FREE",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE"
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  ownerId: string;
  plan: WorkspacePlan;
  createdAt: string;
  updatedAt: string;
}

export interface UserWorkspace {
  workspace: Workspace;
  role: WorkspaceRole;
}

export interface WorkspaceMemberUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

export interface WorkspaceMember {
  _id: string;
  workspaceId: string;
  userId: WorkspaceMemberUser;
  role: WorkspaceRole;
  joinedAt: string;
}
