"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useGlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get("q") ?? "";

  const setValue = useCallback(
    (nextValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = nextValue.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return { value, setValue };
}
