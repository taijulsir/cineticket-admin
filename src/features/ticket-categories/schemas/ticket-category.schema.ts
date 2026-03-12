import { z } from "zod";

export const ticketCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
