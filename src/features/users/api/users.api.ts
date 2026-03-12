import { apiClient, unwrap } from "@/lib/api/apiClient";
import { CUSTOMER_API, EMPLOYEE_API } from "@/lib/constants";

export const usersApi = {
  listEmployees: () => apiClient.get(EMPLOYEE_API).then((r) => unwrap<any[]>(r.data)),
  archiveEmployee: (id: string, isArchive: boolean) => apiClient.patch(`${EMPLOYEE_API}archiveEmployee/${id}`, { isArchive }).then((r) => unwrap<any>(r.data)),
  listCustomers: () => apiClient.get(CUSTOMER_API).then((r) => unwrap<any[]>(r.data)),
  archiveCustomer: (id: string, isActive: boolean) => apiClient.patch(`${CUSTOMER_API}archiveCustomer/${id}`, { isActive }).then((r) => unwrap<any>(r.data)),
};
