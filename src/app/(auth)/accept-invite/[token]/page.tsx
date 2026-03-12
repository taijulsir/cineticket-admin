"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { apiClient, createAuthClient } from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Schema ───────────────────────────────────────────────────────────────

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isValidating, setIsValidating] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", password: "", confirmPassword: "" },
  });

  // ── Validate token ────────────────────────────────────────────────────
  useEffect(() => {
    async function validateToken() {
      try {
        const authClient = createAuthClient();
        const { data } = await authClient.get<{ email: string; role: string }>(
          `validateInviteToken/${params.token}`,
        );
        setEmail(data.email);
        setRole(data.role);
      } catch {
        toast.error("This invitation link is invalid or has expired.");
        router.replace("/login");
      } finally {
        setIsValidating(false);
      }
    }
    if (params.token) validateToken();
  }, [params.token, router]);

  // ── Submit ────────────────────────────────────────────────────────────
  const onSubmit = handleSubmit(async ({ name, password }) => {
    try {
      await apiClient.post("/auth/accept-invite", {
        token: params.token,
        name,
        password,
      });
      toast.success("Account created! Please sign in.");
      router.replace("/login");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to accept invitation.",
      );
    }
  });

  if (isValidating) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Accept Invitation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You've been invited to join CineTicket Admin
        </p>
      </div>

      {/* Pre-filled read-only info */}
      <div className="mb-5 space-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
        <p>
          <span className="text-muted-foreground">Email: </span>
          <span className="font-medium">{email}</span>
        </p>
        {role && (
          <p>
            <span className="text-muted-foreground">Role: </span>
            <span className="font-medium capitalize">
              {role.replace("_", " ").toLowerCase()}
            </span>
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            placeholder="Jane Smith"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Create Account
        </Button>
      </form>
    </div>
  );
}
