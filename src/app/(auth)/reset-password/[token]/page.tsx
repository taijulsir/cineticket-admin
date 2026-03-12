"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAuthClient } from "@/lib/api/apiClient";
import { AUTH_APIS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Schema ───────────────────────────────────────────────────────────────

const schema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword2: z.string().min(6, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.newPassword2, {
    message: "Passwords do not match",
    path: ["newPassword2"],
  });

type FormValues = z.infer<typeof schema>;

// ─── Page ─────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", newPassword2: "" },
  });

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    try {
      const authClient = createAuthClient();
      await authClient.patch(AUTH_APIS.RESET_PASSWORD, {
        token: params.token,
        newPassword,
      });
      toast.success("Password changed successfully. Please log in.");
      router.replace("/login");
    } catch {
      toast.error("Failed to reset password. The link may have expired.");
    }
  });

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" placeholder="••••••••" {...register("newPassword")} /></div>
        <div className="space-y-1.5"><Label htmlFor="newPassword2">Confirm New Password</Label><Input id="newPassword2" type="password" placeholder="••••••••" {...register("newPassword2")} /></div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Change Password
        </Button>
      </form>

      <Link
        href="/login"
        className="block text-center text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to login
      </Link>
    </div>
  );
}
