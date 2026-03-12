"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { employeesApi } from "@/lib/api/employeesApi";
import { EmployeeRole, EmployeeStatus } from "@/types/employee";
import { PageLayout } from "@/components/admin/page-layout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appToast } from "@/lib/toast";
import { useConfirm } from "@/hooks/use-confirm";

const roleColors: Record<EmployeeRole, string> = {
  [EmployeeRole.SUPER_ADMIN]: "bg-purple-100 text-purple-800 border-purple-200",
  [EmployeeRole.ADMIN]: "bg-blue-100 text-blue-800 border-blue-200",
  [EmployeeRole.MANAGER]: "bg-green-100 text-green-800 border-green-200",
  [EmployeeRole.STAFF]: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { confirm } = useConfirm();
  const [role, setRole] = useState<EmployeeRole | null>(null);

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employees", params.id],
    queryFn: () => employeesApi.getById(params.id),
    enabled: !!params.id,
  });

  const updateRoleMutation = useMutation({
    mutationFn: (newRole: EmployeeRole) =>
      employeesApi.updateRole(params.id, { role: newRole }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      appToast.success("Role updated successfully");
    },
    onError: () => appToast.error("Failed to update role"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: EmployeeStatus) =>
      employeesApi.updateStatus(params.id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      appToast.success("Status updated");
    },
    onError: () => appToast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => employeesApi.delete(params.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      appToast.success("Employee removed");
      router.push("/employees");
    },
    onError: () => appToast.error("Failed to delete employee"),
  });

  async function handleStatusToggle() {
    if (!employee) return;
    const isActive = employee.status === EmployeeStatus.ACTIVE;
    const ok = await confirm({
      title: isActive ? "Deactivate Employee" : "Activate Employee",
      description: isActive
        ? `Deactivate ${employee.name}? They will lose access to the admin panel.`
        : `Reactivate ${employee.name}? They will regain access.`,
      destructive: isActive,
      confirmLabel: isActive ? "Deactivate" : "Activate",
    });
    if (!ok) return;
    updateStatusMutation.mutate(
      isActive ? EmployeeStatus.INACTIVE : EmployeeStatus.ACTIVE,
    );
  }

  async function handleDelete() {
    if (!employee) return;
    const ok = await confirm({
      title: "Delete Employee",
      description: `Permanently delete ${employee.name}? This cannot be undone.`,
      destructive: true,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    deleteMutation.mutate();
  }

  function handleRoleSave() {
    if (!role || role === employee?.employeeRole) return;
    updateRoleMutation.mutate(role);
  }

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Employee not found.{" "}
        <Link href="/employees" className="underline">
          Go back
        </Link>
      </div>
    );
  }

  const currentRole = role ?? employee.employeeRole;
  const isActive = employee.status === EmployeeStatus.ACTIVE;

  return (
    <PageLayout
      title={employee.name}
      description={employee.email}
      actions={
        <Link href="/employees">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Employees
          </Button>
        </Link>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Profile card ─────────────────────────────────────────────── */}
        <div className="space-y-4 rounded-lg border bg-muted/30 p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {employee.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{employee.name}</p>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <StatusBadge
                variant={
                  employee.status === EmployeeStatus.ACTIVE
                    ? "success"
                    : employee.status === EmployeeStatus.INVITED
                      ? "warning"
                      : "danger"
                }
              >
                {employee.status}
              </StatusBadge>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${roleColors[employee.employeeRole]}`}
              >
                {employee.employeeRole.replace("_", " ")}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground">Joined</p>
              <p>{new Date(employee.createdAt).toLocaleDateString()}</p>
            </div>
            {employee.invitedBy && (
              <div>
                <p className="text-muted-foreground">Invited By</p>
                <p>{employee.invitedBy.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Role editor ──────────────────────────────────────────────── */}
        <div className="space-y-4 rounded-lg border bg-muted/30 p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Change Role
          </h2>
          <Select
            value={currentRole}
            onValueChange={(v) => setRole(v as EmployeeRole)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(EmployeeRole).map((r) => (
                <SelectItem key={r} value={r}>
                  {r.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleRoleSave}
            disabled={
              !role ||
              role === employee.employeeRole ||
              updateRoleMutation.isPending
            }
            className="w-full"
          >
            {updateRoleMutation.isPending ? "Saving…" : "Save Role"}
          </Button>
        </div>

        {/* ── Permissions list ─────────────────────────────────────────── */}
        {employee.permissions && employee.permissions.length > 0 && (
          <div className="col-span-full space-y-3 rounded-lg border bg-muted/30 p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Permissions
            </h2>
            <div className="flex flex-wrap gap-2">
              {employee.permissions.map((p) => (
                <span
                  key={p}
                  className="rounded border bg-background px-2 py-0.5 text-xs font-mono text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Danger zone ──────────────────────────────────────────────── */}
        <div className="col-span-full space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="text-sm font-semibold text-destructive uppercase tracking-wide">
            Danger Zone
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleStatusToggle}
              disabled={updateStatusMutation.isPending}
            >
              {isActive ? "Deactivate Employee" : "Activate Employee"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete Employee"}
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
