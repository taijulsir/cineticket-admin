import { theatersApi } from "@/features/theaters/api/theaters.api";
import { useMutation } from "@tanstack/react-query";

export function useCreateTheater() {
  return useMutation({ mutationFn: theatersApi.createTheater });
}

export function useCreateHall() {
  return useMutation({ mutationFn: theatersApi.createHall });
}

export function useCreateHallSeat() {
  return useMutation({ mutationFn: theatersApi.createHallSeat });
}
