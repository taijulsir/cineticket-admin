import { z } from "zod";

export const feeSchema = z.object({
  name: z.string().min(1),
  amount: z.number().nonnegative(),
  type: z.enum(["fixed", "percentage"]),
});
