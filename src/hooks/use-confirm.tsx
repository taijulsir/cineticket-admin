"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createContext, useContext, useState } from "react";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<{ confirm: ConfirmFn } | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((result: boolean) => void) | null>(null);

  async function confirm(next: ConfirmOptions) {
    setOptions(next);
    return new Promise<boolean>((resolve) => setResolver(() => resolve));
  }

  function close(result: boolean) {
    resolver?.(result);
    setResolver(null);
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        open={!!options}
        title={options?.title ?? "Confirm"}
        description={options?.description}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        destructive={options?.destructive}
        onCancel={() => close(false)}
        onConfirm={() => close(true)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used inside ConfirmProvider");
  return context;
}

