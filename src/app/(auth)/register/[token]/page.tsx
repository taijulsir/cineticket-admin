"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { createAuthClient } from "@/lib/api/apiClient";
import { AUTH_APIS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Schema ───────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password2: z.string().min(6, "Please confirm your password"),
  })
  .refine((d) => d.password === d.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { register: registerEmployee } = useAuth();

  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("employee");
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [dp, setDp] = useState<File | null>(null);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", password: "", password2: "" },
  });

  // ── Resolve token → email ───────────────────────────────────────────────
  useEffect(() => {
    async function resolveToken() {
      try {
        const authClient = createAuthClient();
        const { data } = await authClient.get<{ email: string; level: string }>(
          `getEmailFromToken/${params.token}`
        );
        setEmail(data.email);
        setLevel(data.level);
      } catch {
        toast.error("Invalid or expired invitation link");
        router.replace("/login");
      } finally {
        setIsLoadingToken(false);
      }
    }
    if (params.token) resolveToken();
  }, [params.token, router]);

  // ── Submit ──────────────────────────────────────────────────────────────
  const onSubmit = handleSubmit(async ({ name, password }) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("level", level);
    if (dp) formData.append("dp", dp);
    await registerEmployee(formData as never);
    router.replace("/login");
  });

  if (isLoadingToken) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registering as <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="name">Full Name</Label><Input id="name" placeholder="Your Name" {...register("name")} /></div>
        <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="••••••••" {...register("password")} /></div>
        <div className="space-y-1.5"><Label htmlFor="password2">Confirm Password</Label><Input id="password2" type="password" placeholder="••••••••" {...register("password2")} /></div>

        {/* Avatar upload */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Display Picture</label>
          <input
            type="file"
            accept="image/*"
            className="block text-sm text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDp(e.target.files?.[0] ?? null)
            }
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Account
        </Button>
      </form>
    </div>
  );
}
