import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DashboardData } from "@/types/dashboard";

export function useDashboardData(workspaceId?: string) {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null as any;
      const res = await apiClient.get(`/workspaces/${workspaceId}/dashboard`);
      return res.data.data;
    },
    enabled: !!workspaceId
  });

  return {
    dashboardData: data,
    isLoading,
    isError
  };
}
