import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { UserWorkspace, Workspace, WorkspaceMember, WorkspaceRole } from "@/types/workspace";
import { useState, useEffect } from "react";

export function useWorkspaces() {
  const queryClient = useQueryClient();
  const [activeWorkspaceSlug, setActiveWorkspaceSlug] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("teamsync_active_workspace");
    }
    return null;
  });

  const { data: userWorkspaces = [], isLoading, isError } = useQuery<UserWorkspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await apiClient.get("/workspaces");
      return res.data.data;
    }
  });

  const activeWorkspaceData = userWorkspaces.find((w) => w.workspace.slug === activeWorkspaceSlug) || userWorkspaces[0];

  useEffect(() => {
    if (userWorkspaces.length > 0 && (!activeWorkspaceSlug || !userWorkspaces.some((w) => w.workspace.slug === activeWorkspaceSlug))) {
      const firstSlug = userWorkspaces[0].workspace.slug;
      setActiveWorkspaceSlug(firstSlug);
      if (typeof window !== "undefined") {
        localStorage.setItem("teamsync_active_workspace", firstSlug);
      }
    }
  }, [userWorkspaces, activeWorkspaceSlug]);

  const switchWorkspace = (slug: string) => {
    setActiveWorkspaceSlug(slug);
    if (typeof window !== "undefined") {
      localStorage.setItem("teamsync_active_workspace", slug);
    }
  };

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await apiClient.post("/workspaces", data);
      return res.data.data as Workspace;
    },
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      switchWorkspace(newWorkspace.slug);
    }
  });

  return {
    userWorkspaces,
    activeWorkspace: activeWorkspaceData?.workspace,
    activeRole: activeWorkspaceData?.role,
    isLoading,
    isError,
    switchWorkspace,
    createWorkspace: createWorkspaceMutation.mutateAsync,
    isCreating: createWorkspaceMutation.isPending
  };
}

export function useWorkspaceMembers(workspaceId?: string) {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery<WorkspaceMember[]>({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await apiClient.get(`/workspaces/${workspaceId}/members`);
      return res.data.data;
    },
    enabled: !!workspaceId
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (data: { email: string; role: WorkspaceRole }) => {
      const res = await apiClient.post(`/workspaces/${workspaceId}/invites`, data);
      return res.data.data;
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: WorkspaceRole }) => {
      const res = await apiClient.patch(`/workspaces/${workspaceId}/members/${userId}`, { role });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    }
  });

  return {
    members,
    isLoading,
    inviteMember: inviteMemberMutation.mutateAsync,
    isInviting: inviteMemberMutation.isPending,
    updateRole: updateRoleMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync
  };
}
