import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { SearchResultsData, SearchCategory } from "@/types/search";

export function useGlobalSearch(workspaceId?: string, query = "", category: SearchCategory = "all") {
  return useInfiniteQuery<SearchResultsData>({
    queryKey: ["global-search", workspaceId, category, query],
    queryFn: async ({ pageParam = 1 }) => {
      if (!workspaceId || !query.trim()) return null as any;
      const res = await apiClient.get(`/workspaces/${workspaceId}/search`, {
        params: {
          q: query.trim(),
          type: category,
          page: pageParam,
          limit: 10
        }
      });
      return res.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!workspaceId && query.trim().length >= 2,
    staleTime: 1000 * 60 * 5 // 5 minutes caching
  });
}
