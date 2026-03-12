"use client";

import { PageLayout } from "@/components/admin/page-layout";
import { CustomersTable } from "@/features/customers/components/customers-table";

export default function CustomersPage() {
  return (
    <PageLayout
      title="Customers"
      description="Manage registered customer accounts and monitor booking activity"
    >
      <CustomersTable />
    </PageLayout>
  );
}
