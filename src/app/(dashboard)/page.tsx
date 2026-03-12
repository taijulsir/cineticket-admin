"use client";

import { PageLayout } from "@/components/admin/page-layout";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, ShoppingCart, Ticket, Wallet } from "lucide-react";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export default function DashboardPage() {
  const { data: stats } = useDashboardStats();

  const cards = [
    { title: "Total Events", value: stats?.totalEvents ?? 0, icon: <Calendar className="h-5 w-5" /> },
    { title: "Total Shows", value: stats?.totalShows ?? 0, icon: <BarChart3 className="h-5 w-5" /> },
    { title: "Total Orders", value: stats?.totalOrders ?? 0, icon: <ShoppingCart className="h-5 w-5" /> },
    { title: "Revenue Today", value: `$${stats?.todayRevenue ?? 0}`, icon: <Wallet className="h-5 w-5" /> },
    { title: "Revenue Month", value: `$${(stats?.todayRevenue ?? 0) * 12}`, icon: <Wallet className="h-5 w-5" /> },
    { title: "Tickets Sold", value: stats?.totalTicketsSold ?? 0, icon: <Ticket className="h-5 w-5" /> },
  ];
  const trendData = [
    { day: "Mon", revenue: 3200, orders: 62 },
    { day: "Tue", revenue: 4100, orders: 71 },
    { day: "Wed", revenue: 3800, orders: 68 },
    { day: "Thu", revenue: 5600, orders: 93 },
    { day: "Fri", revenue: 7200, orders: 121 },
    { day: "Sat", revenue: 8100, orders: 138 },
    { day: "Sun", revenue: 6900, orders: 109 },
  ];

  return (
    <PageLayout title="Dashboard" description="Cinema operations overview and performance insights">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <StatCard key={card.title} title={card.title} value={card.value} icon={card.icon} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card className="rounded-xl border">
            <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" /><YAxis /><Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="rounded-xl border">
            <CardHeader><CardTitle>Orders Chart</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" /><YAxis /><Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
