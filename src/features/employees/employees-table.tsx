"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Shield, UserX, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { employeesApi } from "@/lib/api/employeesApi";
import { Employee, EmployeeRole, EmployeeStatus } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { ReusableTable } from "@/components/shared/tables/ReusableTable";
import { appToast } from "@/lib/toast";
import { InviteEmployeeDialog } from "./invite-employee-dialog";
import { UpdateRoleDialog } from "./update-role-dialog";
import { useConfirm } from "@/hooks/use-confirm";

export function EmployeesTable() {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { confirm } = useConfirm();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: employeesApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployeeStatus }) =>
      employeesApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      appToast.success("Employee status updated successfully");
    },
    onError: () => {
      appToast.error("Failed to update employee status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: employeesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      appToast.success("Employee deleted successfully");
    },
    onError: () => {
      appToast.error("Failed to delete employee");
    },
  });

  const handleDeactivate = async (employee: Employee) => {
    const ok = await confirm({
      title: "Are you sure?",
      description: `This will ${employee.status === EmployeeStatus.ACTIVE ? "deactivate" : "activate"} the employee.`,
      destructive: true,
    });
    if (ok) {
      const newStatus =
        employee.status === EmployeeStatus.ACTIVE
          ? EmployeeStatus.INACTIVE
          : EmployeeStatus.ACTIVE;
      updateStatusMutation.mutate({ id: employee.id, status: newStatus });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete employee?",
      description: "This action cannot be undone.",
      destructive: true,
    });
    if (ok) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditRole = (employee: Employee) => {
    setSelectedEmployee(employee);
    setRoleDialogOpen(true);
  };

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "employeeRole",
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.employeeRole;
          const colors: Record<EmployeeRole, string> = {
            [EmployeeRole.SUPER_ADMIN]: "bg-purple-100 text-purple-800",
            [EmployeeRole.ADMIN]: "bg-blue-100 text-blue-800",
            [EmployeeRole.MANAGER]: "bg-green-100 text-green-800",
            [EmployeeRole.STAFF]: "bg-gray-100 text-gray-800",
          };
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${colors[role]}`}>
              {role}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const colors: Record<EmployeeStatus, string> = {
            [EmployeeStatus.ACTIVE]: "bg-green-100 text-green-800",
            [EmployeeStatus.INVITED]: "bg-yellow-100 text-yellow-800",
            [EmployeeStatus.INACTIVE]: "bg-red-100 text-red-800",
          };
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "invitedBy.name",
        header: "Invited By",
        cell: ({ row }) => row.original.invitedBy?.name || "N/A",
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditRole(employee)}
              >
                <Shield className="h-4 w-4 mr-1" />
                Role
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeactivate(employee)}
              >
                <UserX className="h-4 w-4 mr-1" />
                {employee.status === EmployeeStatus.ACTIVE ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(employee.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">
              Manage employee accounts and permissions
            </p>
          </div>
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite Employee
          </Button>
        </div>

        <ReusableTable
          data={employees}
          columns={columns}
          loading={isLoading}
          searchKey="name"
          searchPlaceholder="Search employees..."
        />
      </div>

      <InviteEmployeeDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      {selectedEmployee && (
        <UpdateRoleDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          employee={selectedEmployee}
        />
      )}
    </>
  );
}

