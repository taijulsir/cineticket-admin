"use client";

import { CustomerDetailView } from "@/features/customers/components/customer-detail-view";

interface CustomerDetailPageProps {
  params: { id: string };
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  return <CustomerDetailView customerId={params.id} />;
}
