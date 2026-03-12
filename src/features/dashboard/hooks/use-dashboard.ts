import { dashboardApi } from "@/features/dashboard/api/dashboard.api";
import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({ queryKey: ["admin-stats"], queryFn: dashboardApi.stats });
}
