import { apiClient, unwrap } from "@/lib/api/apiClient";
import { PRODUCER_API } from "@/lib/constants";

export const producersApi = {
  list: () => apiClient.get(`${PRODUCER_API}?filter=active`).then((r) => unwrap<any[]>(r.data)),
  archive: (id: string, isArchive: boolean) => apiClient.patch(`${PRODUCER_API}archiveProducer/${id}`, { isArchive }).then((r) => unwrap<any>(r.data)),
};
