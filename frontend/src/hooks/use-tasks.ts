import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskComment, ActivityLog } from "@/types/task";

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
}

export function useTasks(projectId?: string, filters: TaskFilters = {}) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, isError } = useQuery<Task[]>({
    queryKey: ["tasks", projectId, filters],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await apiClient.get(`/projects/${projectId}/tasks`, { params: filters });
      return res.data.data;
    },
    enabled: !!projectId
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskPayload) => {
      const res = await apiClient.post(`/projects/${projectId}/tasks`, data);
      return res.data.data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    }
  });

  return {
    tasks,
    isLoading,
    isError,
    createTask: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending
  };
}

export function useTaskDetails(taskId?: string) {
  const queryClient = useQueryClient();

  const { data: task, isLoading, isError } = useQuery<Task>({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null as any;
      const res = await apiClient.get(`/tasks/${taskId}`);
      return res.data.data;
    },
    enabled: !!taskId
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: UpdateTaskPayload) => {
      const res = await apiClient.patch(`/tasks/${taskId}`, data);
      return res.data.data as Task;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["task", taskId], updated);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-activities", taskId] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete(`/tasks/${taskId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  return {
    task,
    isLoading,
    isError,
    updateTask: updateTaskMutation.mutateAsync,
    isUpdating: updateTaskMutation.isPending,
    deleteTask: deleteTaskMutation.mutateAsync,
    isDeleting: deleteTaskMutation.isPending
  };
}

export function useTaskComments(taskId?: string) {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<TaskComment[]>({
    queryKey: ["task-comments", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await apiClient.get(`/tasks/${taskId}/comments`);
      return res.data.data;
    },
    enabled: !!taskId
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiClient.post(`/tasks/${taskId}/comments`, { content });
      return res.data.data as TaskComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-activities", taskId] });
    }
  });

  return {
    comments,
    isLoading,
    addComment: addCommentMutation.mutateAsync,
    isAddingComment: addCommentMutation.isPending
  };
}

export function useTaskActivities(taskId?: string) {
  const { data: activities = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["task-activities", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await apiClient.get(`/tasks/${taskId}/activities`);
      return res.data.data;
    },
    enabled: !!taskId
  });

  return { activities, isLoading };
}
