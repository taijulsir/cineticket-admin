import { apiClient } from "@/lib/api/apiClient";
import { createEvent, deleteEvent, getEvents, updateEvent } from "@/lib/api/eventsApi";

export const eventsApi = {
  list: () => getEvents({ page: 1, limit: 50 }).then((r) => r.data),
  create: createEvent,
  update: updateEvent,
  remove: deleteEvent,
  uploadPoster: async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    const up = await apiClient.post("/admin/events/upload-poster", body, { headers: { "Content-Type": "multipart/form-data" } });
    return up.data?.data?.imageUrl ?? up.data?.imageUrl;
  },
};
