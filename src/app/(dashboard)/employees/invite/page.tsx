"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { employeesApi } from "@/lib/api/employeesApi";
import { EmployeeRole } from "@/types/employee";
import { PageLayout } from "@/components/admin/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appToast } from "@/lib/toast";

// ─── Schema ───────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.nativeEnum(EmployeeRole),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const roleDescriptions: Record<EmployeeRole, string> = {
  [EmployeeRole.SUPER_ADMIN]: "Full system control — all permissions",
  [EmployeeRole.ADMIN]: "Manage movies, theaters, employees & bookings",
  [EmployeeRole.MANAGER]: "Manage shows, bookings & orders",
  [EmployeeRole.STAFF]: "View bookings and assist customers",
};

// ─── Page ─────────────────────────────────────────────────────────────────

export default function InviteEmployeePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>(EmployeeRole.STAFF);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: "", email: "", role: EmployeeRole.STAFF },
  });

  const inviteMutation = useMutation({
    mutationFn: employeesApi.invite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      appToast.success("Invitation sent successfully");
      router.push("/employees");
    },
    onError: (error: any) => {
      appToast.error(
        error?.response?.data?.message ?? "Failed to send invitation",
      );
    },
  });

  const onSubmit = handleSubmit((values) => {
    inviteMutation.mutate(values);
  });

  return (
    <PageLayout
      title="Invite Employee"
      description="Send an invitation email to onboard a new team member"
      actions={
        <Link href="/employees">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </Link>
      }
    >
      <div className="mx-auto max-w-lg">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
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

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@example.com"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => {
                const role = v as EmployeeRole;
                setSelectedRole(role);
                setValue("role", role);
              }}
            >
              <SelectTrigger id="role" aria-invalid={!!errors.role}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(EmployeeRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    <div>
                      <div className="font-medium capitalize">
                        {role.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {roleDescriptions[role]}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* Role info card */}
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {selectedRole.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
            <p className="mt-0.5">{roleDescriptions[selectedRole]}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={inviteMutation.isPending}
              className="flex-1"
            >
              {inviteMutation.isPending ? (
                "Sending…"
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
            <Link href="/employees">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
