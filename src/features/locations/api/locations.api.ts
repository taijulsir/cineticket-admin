import { apiClient, unwrap } from "@/lib/api/apiClient";
import { CITY_API, COUNTRY_API, STATE_API } from "@/lib/constants";

export const locationsApi = {
  listCountries: () => apiClient.get(COUNTRY_API).then((r) => unwrap<any[]>(r.data)),
  archiveCountry: (id: string, isArchive: boolean) => apiClient.patch(`${COUNTRY_API}archiveCountry/${id}`, { isArchive }).then((r) => unwrap<any>(r.data)),
  listStates: () => apiClient.get(STATE_API).then((r) => unwrap<any[]>(r.data)),
  archiveState: (id: string, isArchive: boolean) => apiClient.patch(`${STATE_API}archiveState/${id}`, { isArchive }).then((r) => unwrap<any>(r.data)),
  listCities: () => apiClient.get(CITY_API).then((r) => unwrap<any[]>(r.data)),
  archiveCity: (id: string, isArchive: boolean) => apiClient.patch(`${CITY_API}archiveCity/${id}`, { isArchive }).then((r) => unwrap<any>(r.data)),
};
