"use client";

import { PageLayout } from "@/components/admin/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moviesApi, type TmdbMovieSearchResult } from "@/features/movies/api/movies.api";
import { appToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { CalendarDays, Loader2, Star } from "lucide-react";
import { useState } from "react";

export default function MovieImportPage() {
  const [title, setTitle] = useState("");
  const [results, setResults] = useState<TmdbMovieSearchResult[]>([]);

  const searchMutation = useMutation({
    mutationFn: (query: string) => moviesApi.search(query),
    onSuccess: (data) => setResults(data),
    onError: (error: any) => appToast.error(error?.message ?? "Failed to search movies"),
  });

  const importMutation = useMutation({
    mutationFn: (movieId: string) => moviesApi.importById(movieId),
    onSuccess: (data) => appToast.success(`Imported "${data?.name ?? "movie"}"`),
    onError: (error: any) => appToast.error(error?.message ?? "Failed to import movie"),
  });

  return (
    <PageLayout title="Import Movie" description="Search TMDB and import movie data into events">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Search movie title..."
            onKeyDown={(event) => {
              if (event.key === "Enter" && title.trim()) searchMutation.mutate(title.trim());
            }}
          />
          <Button
            onClick={() => searchMutation.mutate(title.trim())}
            disabled={!title.trim() || searchMutation.isPending}
          >
            {searchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map((movie) => (
            <article key={movie.id} className="rounded-xl border bg-card p-3 shadow-sm">
              <div className="mb-3 aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No Poster
                  </div>
                )}
              </div>
              <h3 className="line-clamp-2 font-semibold">{movie.title}</h3>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {movie.year ?? "N/A"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  {movie.rating?.toFixed?.(1) ?? "0.0"}
                </span>
              </div>
              <Button
                className="mt-3 w-full"
                onClick={() => importMutation.mutate(movie.id)}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? "Importing..." : "Import"}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
