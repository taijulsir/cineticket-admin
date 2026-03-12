import { archiveHall, createHall, createHallSeat, createTheater, deleteHall, getHallSeats, getHalls, getTheaters, updateHallSeat } from "@/lib/api/theatersApi";

export const theatersApi = {
  list: getTheaters,
  listHalls: getHalls,
  listHallSeats: getHallSeats,
  createTheater,
  createHall,
  createHallSeat,
  updateHallSeat,
  archiveHall,
  deleteHall,
};
