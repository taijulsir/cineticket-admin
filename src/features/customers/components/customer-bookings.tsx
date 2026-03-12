"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { CustomerBooking } from "@/types";

interface CustomerBookingsProps {
  bookings: CustomerBooking[];
}

export function CustomerBookings({ bookings }: CustomerBookingsProps) {
  if (!bookings || bookings.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No bookings found for this customer.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Movie</th>
            <th className="pb-2 pr-4 font-medium">Theater</th>
            <th className="pb-2 pr-4 font-medium">Showtime</th>
            <th className="pb-2 pr-4 font-medium">Seats</th>
            <th className="pb-2 pr-4 font-medium">Amount</th>
            <th className="pb-2 font-medium">Payment</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {bookings.map((booking) => (
            <tr key={booking._id} className="text-sm">
              <td className="py-3 pr-4 font-medium">{booking.movieName}</td>
              <td className="py-3 pr-4 text-muted-foreground">
                {booking.theaterName}
              </td>
              <td className="py-3 pr-4 text-muted-foreground">
                <div>{new Date(booking.showDate).toLocaleDateString()}</div>
                <div className="text-xs">{booking.showTime}</div>
              </td>
              <td className="py-3 pr-4">
                {booking.seats && booking.seats.length > 0
                  ? booking.seats.join(", ")
                  : "-"}
              </td>
              <td className="py-3 pr-4 tabular-nums">
                ${(booking.totalAmount ?? 0).toFixed(2)}
              </td>
              <td className="py-3">
                <StatusBadge
                  variant={
                    booking.paymentStatus === "PAID"
                      ? "success"
                      : booking.paymentStatus === "FAILED"
                        ? "danger"
                        : "warning"
                  }
                >
                  {booking.paymentStatus}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
