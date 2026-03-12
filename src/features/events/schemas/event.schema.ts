import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  status: z.enum(["NOW_SELLING", "UPCOMING", "PAST", "ARCHIVED", "VOTE_FOR_BRING"]).or(z.enum(["NOW_SELLING", "UPCOMING", "PAST", "VOTE_TO_BRING"])),
});

