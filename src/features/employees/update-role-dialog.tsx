"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "@/lib/api/employeesApi";
import { Employee, EmployeeRole } from "@/types/employee";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appToast } from "@/lib/toast";

interface UpdateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
}

export function UpdateRoleDialog({
  open,
  onOpenChange,
  employee,
}: UpdateRoleDialogProps) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<EmployeeRole>(employee.employeeRole);

  const updateRoleMutation = useMutation({
    mutationFn: (newRole: EmployeeRole) =>
      employeesApi.updateRole(employee.id, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      appToast.success("Employee role updated successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
      appToast.error(error.response?.data?.message || "Failed to update role");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoleMutation.mutate(role);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Employee Role</DialogTitle>
          <DialogDescription>
            Change the role and permissions for {employee.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as EmployeeRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EmployeeRole.STAFF}>
                  <div>
                    <div className="font-medium">Staff</div>
                    <div className="text-xs text-muted-foreground">
                      Basic access to view orders and customers
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={EmployeeRole.MANAGER}>
                  <div>
                    <div className="font-medium">Manager</div>
                    <div className="text-xs text-muted-foreground">
                      Manage shows, bookings, and orders
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={EmployeeRole.ADMIN}>
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-muted-foreground">
                      Full access except system settings
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={EmployeeRole.SUPER_ADMIN}>
                  <div>
                    <div className="font-medium">Super Admin</div>
                    <div className="text-xs text-muted-foreground">
                      Complete system control
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
