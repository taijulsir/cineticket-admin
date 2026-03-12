import { z } from "zod";

export const producerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
