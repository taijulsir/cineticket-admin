"use client";

import { PageLayout } from "@/components/admin/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { ordersApi } from "@/features/orders/api/orders.api";
import { appToast } from "@/lib/toast";
import { useState } from "react";

export default function SearchOrderPage() {
  const [searchMethod, setSearchMethod] = useState<"orderId" | "transactionId">("orderId");
  const [searchText, setSearchText] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSearch() {
    try {
      setLoading(true);
      const data = await ordersApi.searchOrder(searchMethod, searchText);
      setResult(data);
    } catch {
      appToast.error("Order not found");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout title="Search Order" description="Look up an order by order id or transaction id">
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Button variant={searchMethod === "orderId" ? "primary" : "outline"} onClick={() => setSearchMethod("orderId")}>Order ID</Button>
          <Button variant={searchMethod === "transactionId" ? "primary" : "outline"} onClick={() => setSearchMethod("transactionId")}>Transaction ID</Button>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">{searchMethod === "orderId" ? "Order ID" : "Transaction ID"}</label>
            <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Enter value" />
          </div>
          <Button onClick={onSearch} disabled={loading}>{loading ? "Searching..." : "Search"}</Button>
        </div>
        {result?.order ? (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Order Found</h3>
              <StatusBadge variant={result.order.isArchive ? "warning" : "success"}>{result.order.isArchive ? "ARCHIVED" : "ACTIVE"}</StatusBadge>
            </div>
            <p className="text-sm">Order: <span className="font-medium">{result.order.orderId}</span></p>
            <p className="text-sm">Customer: <span className="font-medium">{result.order.customerName}</span></p>
            <p className="text-sm">Email: <span className="font-medium">{result.order.customerEmail}</span></p>
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
}

