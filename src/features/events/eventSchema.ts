import { z } from "zod";

// ─── Shared event fields ──────────────────────────────────────────────────

export const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  organizer: z.string().min(1, "Organizer is required"),
  releaseDate: z.string().min(1, "Release date is required"),
  type: z.enum(["movie", "others"], {
    required_error: "Please select a type",
  }),
  duration: z.string().min(1, "Duration is required"),
  releaseType: z.enum(["private screen", "theatrical", ""], {
    required_error: "Please select a release type",
  }),
  theatricalLink: z.string().optional(),
  trailerVideoLink: z.string().optional(),
  eventCurrency: z.string().min(1, "Currency is required"),
});

export type EventFormValues = z.infer<typeof eventSchema>;
