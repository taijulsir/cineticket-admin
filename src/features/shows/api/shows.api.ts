import { createShow, getSeatMap, getShowSeats, getShows, updateShow } from "@/lib/api/showsApi";

export const showsApi = {
  list: () => getShows({ page: 1, limit: 50 }).then((r) => r.data),
  create: createShow,
  update: updateShow,
  getSeatMap,
  getShowSeats,
};
