"use client";

import { PageLayout } from "@/components/admin/page-layout";
import { EmployeeRole } from "@/types/employee";

// ─── Role → Permission mapping (mirrors backend RBAC) ─────────────────────

const PERMISSIONS: Record<string, string> = {
  manage_movies: "Manage Movies",
  manage_shows: "Manage Shows",
  manage_theaters: "Manage Theaters",
  manage_bookings: "Manage Bookings",
  manage_employees: "Manage Employees",
  manage_promo_codes: "Manage Promo Codes",
  view_reports: "View Reports",
  view_audit_logs: "View Audit Logs",
  manage_settings: "Manage Settings",
  manage_customers: "Manage Customers",
};

const ROLE_GRANTS: Record<EmployeeRole, string[]> = {
  [EmployeeRole.SUPER_ADMIN]: Object.keys(PERMISSIONS),
  [EmployeeRole.ADMIN]: [
    "manage_movies",
    "manage_shows",
    "manage_theaters",
    "manage_bookings",
    "manage_employees",
    "manage_promo_codes",
    "manage_customers",
    "view_reports",
    "view_audit_logs",
  ],
  [EmployeeRole.MANAGER]: [
    "manage_shows",
    "manage_bookings",
    "manage_promo_codes",
    "view_reports",
  ],
  [EmployeeRole.STAFF]: [
    "manage_bookings",
    "view_reports",
  ],
};

const ROLE_LABELS: Record<EmployeeRole, string> = {
  [EmployeeRole.SUPER_ADMIN]: "Super Admin",
  [EmployeeRole.ADMIN]: "Admin",
  [EmployeeRole.MANAGER]: "Manager",
  [EmployeeRole.STAFF]: "Staff",
};

const roleHeaderColors: Record<EmployeeRole, string> = {
  [EmployeeRole.SUPER_ADMIN]: "text-purple-700",
  [EmployeeRole.ADMIN]: "text-blue-700",
  [EmployeeRole.MANAGER]: "text-green-700",
  [EmployeeRole.STAFF]: "text-slate-700",
};

// ─── Page ─────────────────────────────────────────────────────────────────

export default function RolesPermissionsPage() {
  const roles = Object.values(EmployeeRole);
  const permissions = Object.keys(PERMISSIONS);

  return (
    <PageLayout
      title="Roles & Permissions"
      description="Overview of what each role can access in the admin panel"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-3 pr-6 text-left text-muted-foreground font-medium">
                Permission
              </th>
              {roles.map((role) => (
                <th
                  key={role}
                  className={`py-3 px-4 text-center font-semibold ${roleHeaderColors[role]}`}
                >
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {permissions.map((perm) => (
              <tr key={perm} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 pr-6">
                  <p className="font-medium">{PERMISSIONS[perm]}</p>
                  <p className="text-xs font-mono text-muted-foreground">{perm}</p>
                </td>
                {roles.map((role) => {
                  const granted = ROLE_GRANTS[role].includes(perm);
                  return (
                    <td key={role} className="py-3 px-4 text-center">
                      {granted ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mx-auto">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xs mx-auto">
                          –
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role description cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => (
          <div key={role} className="rounded-lg border p-4 space-y-2">
            <h3 className={`font-semibold ${roleHeaderColors[role]}`}>
              {ROLE_LABELS[role]}
            </h3>
            <p className="text-xs text-muted-foreground">
              {ROLE_GRANTS[role].length} of {permissions.length} permissions
            </p>
            <ul className="space-y-1">
              {ROLE_GRANTS[role].map((p) => (
                <li key={p} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                  {PERMISSIONS[p]}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
