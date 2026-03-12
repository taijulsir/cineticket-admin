"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAuthClient } from "@/lib/api/apiClient";
import { AUTH_APIS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

// ─── Page ─────────────────────────────────────────────────────────────────

export default function RecoverPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      const authClient = createAuthClient();
      await authClient.post(AUTH_APIS.FORGOT_PASSWORD, { email });
      setSentEmail(email);
      setEmailSent(true);
    } catch {
      toast.error("Failed to send recovery email. Please try again.");
    }
  });

  const handleResend = async () => {
    try {
      const authClient = createAuthClient();
      await authClient.post(AUTH_APIS.FORGOT_PASSWORD, { email: sentEmail });
      toast.success("Recovery email resent");
    } catch {
      toast.error("Failed to resend. Please try again.");
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If we found an account for{" "}
            <strong className="text-foreground">{sentEmail}</strong>, a recovery
            link has been sent.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Didn&apos;t receive a link?</span>
          <button
            onClick={handleResend}
            className="text-primary underline-offset-4 hover:underline"
          >
            Resend email
          </button>
        </div>
        <Link href="/login" className="block text-sm text-muted-foreground hover:text-foreground">
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Recover Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a recovery link
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send Recovery Email
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
