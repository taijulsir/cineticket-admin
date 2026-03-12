import { apiClient, unwrap } from "@/lib/api/apiClient";

export type TmdbMovieSearchResult = {
  id: string;
  title: string;
  year: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number;
  releaseDate: string | null;
};

export const moviesApi = {
  search: (title: string) =>
    apiClient
      .get("/admin/movies/search", { params: { title } })
      .then((response) => unwrap<TmdbMovieSearchResult[]>(response.data)),
  importById: (id: string) =>
    apiClient
      .get(`/admin/movies/import/${id}`)
      .then((response) => unwrap<any>(response.data)),
};
