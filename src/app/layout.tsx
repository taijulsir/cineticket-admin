import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { AppErrorBoundary } from "@/components/error/AppErrorBoundary";
import { QueryProvider } from "@/components/providers/query-provider";
import { ConfirmProvider } from "@/hooks/use-confirm";

export const metadata: Metadata = {
  title: "CineTicket Admin",
  description: "CineTicket Admin Dashboard",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppErrorBoundary>
          <QueryProvider>
            <ConfirmProvider>
              <AuthProvider>
                {children}
                <Toaster richColors position="top-right" />
              </AuthProvider>
            </ConfirmProvider>
          </QueryProvider>
        </AppErrorBoundary>
      </body>
    </html>
  );
}
