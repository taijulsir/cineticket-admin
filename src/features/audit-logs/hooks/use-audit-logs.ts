import { auditLogsApi } from "@/features/audit-logs/api/audit-logs.api";
import { useQuery } from "@tanstack/react-query";

export function useAuditLogs(page = 1, limit = 100) {
  return useQuery({ queryKey: ["audit-logs", page, limit], queryFn: () => auditLogsApi.list(page, limit) });
}
