import { getAuditLogs } from "@/lib/api/auditLogsApi";

export const auditLogsApi = {
  list: (page = 1, limit = 100) => getAuditLogs(page, limit),
};
