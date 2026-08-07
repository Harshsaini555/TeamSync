export interface ProjectLead {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ProjectMemberUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Project {
  _id: string;
  workspaceId: string;
  name: string;
  key: string;
  description?: string;
  color?: string;
  leadId: ProjectLead;
  members: ProjectMemberUser[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
