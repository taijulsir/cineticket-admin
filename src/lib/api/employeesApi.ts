import { apiClient } from "./apiClient";
import {
  Employee,
  InviteEmployeePayload,
  UpdateEmployeeRolePayload,
  UpdateEmployeeStatusPayload,
  AcceptInvitePayload,
} from "@/types/employee";

export const employeesApi = {
  getAll: async (): Promise<Employee[]> => {
    const { data } = await apiClient.get("/employees");
    return data;
  },

  getById: async (id: string): Promise<Employee> => {
    const { data } = await apiClient.get(`/employees/${id}`);
    return data;
  },

  invite: async (payload: InviteEmployeePayload) => {
    const { data } = await apiClient.post("/employees/invite", payload);
    return data;
  },

  updateRole: async (id: string, payload: UpdateEmployeeRolePayload) => {
    const { data } = await apiClient.patch(`/employees/${id}/role`, payload);
    return data;
  },

  updateStatus: async (id: string, payload: UpdateEmployeeStatusPayload) => {
    const { data } = await apiClient.patch(`/employees/${id}/status`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/employees/${id}`);
    return data;
  },

  /** POST /api/auth/accept-invite — complete signup via invitation token */
  acceptInvite: async (payload: AcceptInvitePayload) => {
    const { data } = await apiClient.post("/auth/accept-invite", payload);
    return data;
  },
};
