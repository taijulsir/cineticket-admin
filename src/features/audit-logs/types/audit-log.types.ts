export type AuditLogItem = {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  createdAt: string;
};
