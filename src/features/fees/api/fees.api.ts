import { apiClient, unwrap } from "@/lib/api/apiClient";
import { FEES_API } from "@/lib/constants";

export const feesApi = {
  list: () => apiClient.get(FEES_API).then((r) => unwrap<any[]>(r.data)),
  archive: (id: string, isArchive: boolean) => apiClient.patch(`${FEES_API}archiveFee/${id}`, { isArchive }).then((r) => unwrap<any>(r.data)),
};
