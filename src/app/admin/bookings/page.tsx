import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui/Card";
import { formatJakarta, isPast } from "@/lib/time/timezone";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";
import { MarkCompleteButton } from "@/components/booking/MarkCompleteButton";
import { LogMissedSessionForm } from "@/components/booking/LogMissedSessionForm";
import type { BookingStatus, BookingType } from "@/lib/supabase/database.types";

const STATUS_TONE: Record<BookingStatus, "green" | "neutral" | "amber" | "red"> = {
  booked: "green",
  completed: "neutral",
  missed: "amber",
  cancelled: "red",
};

const TYPE_LABEL: Record<BookingType, string> = {
  makeup: "Makeup",
  additional: "Additional",
  open_hour: "Open Hour",
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, students(name), slot_instances(starts_at, coaches(name))")
    .order("created_at", { ascending: false })
    .limit(150);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">All Bookings</h1>
      <div className="space-y-2">
        {bookings?.map((b) => {
          const student = b.students as unknown as { name: string } | null;
          const slot = b.slot_instances as unknown as {
            starts_at: string;
            coaches: { name: string } | null;
          } | null;
          const isSlotPast = slot ? isPast(slot.starts_at) : false;

          return (
            <Card key={b.id} className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">
                  {student?.name} <Badge className="ml-1">{TYPE_LABEL[b.type as BookingType]}</Badge>
                </p>
                <p className="text-sm text-gray-500">
                  {slot ? formatJakarta(slot.starts_at) : "—"}
                  {slot?.coaches ? ` · ${slot.coaches.name}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge tone={STATUS_TONE[b.status as BookingStatus]}>{b.status}</Badge>
                {b.status === "booked" && (
                  <div className="flex gap-2">
                    {isSlotPast &&<MarkCompleteButton bookingId={b.id} />}
                    {isSlotPast &&<LogMissedSessionForm bookingId={b.id} />}
                    <CancelBookingButton bookingId={b.id} />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
