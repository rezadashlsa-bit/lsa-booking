import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { Card, Badge } from "@/components/ui/Card";
import { formatJakarta } from "@/lib/time/timezone";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";
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

export default async function ParentBookingsPage() {
  const session = await getSessionProfile();
  const familyId = session!.profile!.family_id!;
  const supabase = await createClient();

  const { data: students } = await supabase.from("students").select("id, name").eq("family_id", familyId);
  const studentIds = (students ?? []).map((s) => s.id);

  const { data: bookings } = studentIds.length
    ? await supabase
        .from("bookings")
        .select("*, students(name), slot_instances(starts_at, coaches(name))")
        .in("student_id", studentIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My Bookings</h1>
      {bookings?.length === 0 && <p className="text-sm text-gray-500">No bookings yet.</p>}
      <div className="space-y-2">
        {bookings?.map((b) => {
          const student = b.students as unknown as { name: string } | null;
          const slot = b.slot_instances as unknown as {
            starts_at: string;
            coaches: { name: string } | null;
          } | null;
          return (
            <Card key={b.id} className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">
                  {student?.name}{" "}
                  <Badge className="ml-1">{TYPE_LABEL[b.type as BookingType]}</Badge>
                </p>
                <p className="text-sm text-gray-500">
                  {slot ? formatJakarta(slot.starts_at) : "—"}
                  {slot?.coaches ? ` · ${slot.coaches.name}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONE[b.status as BookingStatus]}>{b.status}</Badge>
                {b.status === "booked" && <CancelBookingButton bookingId={b.id} />}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
