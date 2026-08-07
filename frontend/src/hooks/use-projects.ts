import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Project } from "@/types/project";

export function useProjects(workspaceId?: string, includeArchived = false) {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, isError } = useQuery<Project[]>({
    queryKey: ["projects", workspaceId, includeArchived],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await apiClient.get(`/workspaces/${workspaceId}/projects`, {
        params: { includeArchived }
      });
      return res.data.data;
    },
    enabled: !!workspaceId
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; key: string; description?: string; color?: string; leadId?: string }) => {
      const res = await apiClient.post(`/workspaces/${workspaceId}/projects`, data);
      return res.data.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
    }
  });

  return {
    projects,
    isLoading,
    isError,
    createProject: createProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending
  };
}

export function useProjectDetails(projectId?: string) {
  const queryClient = useQueryClient();

  const { data: project, isLoading, isError } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null as any;
      const res = await apiClient.get(`/projects/${projectId}`);
      return res.data.data;
    },
    enabled: !!projectId
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const res = await apiClient.patch(`/projects/${projectId}`, data);
      return res.data.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const archiveProjectMutation = useMutation({
    mutationFn: async (isArchived: boolean) => {
      const res = await apiClient.patch(`/projects/${projectId}/archive`, { isArchived });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete(`/projects/${projectId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  return {
    project,
    isLoading,
    isError,
    updateProject: updateProjectMutation.mutateAsync,
    isUpdating: updateProjectMutation.isPending,
    archiveProject: archiveProjectMutation.mutateAsync,
    isArchiving: archiveProjectMutation.isPending,
    deleteProject: deleteProjectMutation.mutateAsync,
    isDeleting: deleteProjectMutation.isPending
  };
}
