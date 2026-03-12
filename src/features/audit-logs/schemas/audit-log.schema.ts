import { z } from "zod";

export const auditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  resource: z.string(),
});
