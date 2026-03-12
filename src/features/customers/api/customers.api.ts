import { apiClient, unwrap } from "@/lib/api/apiClient";
import { CUSTOMERS_ADMIN_API } from "@/lib/constants";
import type {
  Customer,
  CustomerDetail,
  CustomerStatus,
} from "@/types";

export const customersApi = {
  /**
   * GET /api/admin/customers
   * Returns all customers with summary info.
   */
  list: (): Promise<Customer[]> =>
    apiClient.get(CUSTOMERS_ADMIN_API).then((r) => unwrap<Customer[]>(r.data)),

  /**
   * GET /api/admin/customers/:id
   * Returns full customer detail including booking history.
   */
  getById: (id: string): Promise<CustomerDetail> =>
    apiClient
      .get(`${CUSTOMERS_ADMIN_API}${id}`)
      .then((r) => unwrap<CustomerDetail>(r.data)),

  /**
   * PATCH /api/admin/customers/:id/status
   * Block or unblock a customer.
   */
  updateStatus: (id: string, status: CustomerStatus): Promise<Customer> =>
    apiClient
      .patch(`${CUSTOMERS_ADMIN_API}${id}/status`, { status })
      .then((r) => unwrap<Customer>(r.data)),

  /**
   * DELETE /api/admin/customers/:id
   * Permanently delete a customer account.
   */
  remove: (id: string): Promise<void> =>
    apiClient
      .delete(`${CUSTOMERS_ADMIN_API}${id}`)
      .then((r) => unwrap<void>(r.data)),
};
