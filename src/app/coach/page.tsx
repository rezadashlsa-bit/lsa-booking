import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { Card, Badge } from "@/components/ui/Card";
import { formatJakarta } from "@/lib/time/timezone";

export default async function CoachDashboardPage() {
  const session = await getSessionProfile();
  const coachId = session!.profile!.coach_id!;
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, type, students(name), slot_instances!inner(starts_at, coach_id)")
    .eq("slot_instances.coach_id", coachId)
    .eq("status", "booked")
    .gt("slot_instances.starts_at", new Date().toISOString())
    .order("starts_at", { referencedTable: "slot_instances", ascending: true })
    .limit(10);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Today &amp; Upcoming</h1>
      {bookings?.length === 0 && <p className="text-sm text-gray-500">No upcoming sessions.</p>}
      <div className="space-y-2">
        {bookings?.map((b) => {
          const student = b.students as unknown as { name: string } | null;
          const slot = b.slot_instances as unknown as { starts_at: string } | null;
          return (
            <Card key={b.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{student?.name}</p>
                <p className="text-sm text-gray-500">{slot ? formatJakarta(slot.starts_at) : "—"}</p>
              </div>
              <Badge tone="green">{b.type}</Badge>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
