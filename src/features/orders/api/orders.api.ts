import { apiClient, unwrap } from "@/lib/api/apiClient";
import { getOrders } from "@/lib/api/ordersApi";
import { DUPLICATE_ORDERS_API, ORDERS_API, SEARCH_ORDER_API } from "@/lib/constants";

export const ordersApi = {
  list: (page = 1, limit = 20) => getOrders({ page, limit }),
  listByShow: (showId: string, filter: "active" | "archived" | "all" = "active") =>
    apiClient.get(`${ORDERS_API}?filter=${filter}&showId=${showId}`).then((r) => unwrap<any[]>(r.data)),
  archive: (id: string, isArchive: boolean) =>
    apiClient.patch(`${ORDERS_API}archiveOrder/${id}`, { isArchive }).then((r) => unwrap<any>(r.data)),
  sendEmail: (id: string) => apiClient.post(`${ORDERS_API}sendEmail/${id}`).then((r) => unwrap<any>(r.data)),
  searchOrder: (searchMethod: "orderId" | "transactionId", searchText: string) =>
    apiClient.post(SEARCH_ORDER_API, searchMethod === "orderId" ? { orderId: searchText } : { transactionId: searchText }).then((r) => unwrap<any>(r.data)),
  duplicates: () => apiClient.get(DUPLICATE_ORDERS_API).then((r) => unwrap<any>(r.data)),
};
