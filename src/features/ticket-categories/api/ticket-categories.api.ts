import { apiClient, unwrap } from "@/lib/api/apiClient";
import { TICKET_CATEGORY_API } from "@/lib/constants";

export const ticketCategoriesApi = {
  list: () => apiClient.get(TICKET_CATEGORY_API).then((r) => unwrap<any[]>(r.data)),
  archive: (id: string, isArchive: boolean) => apiClient.patch(`${TICKET_CATEGORY_API}archiveTicketCategory/${id}`, { isArchive }).then((r) => unwrap<any>(r.data)),
};
