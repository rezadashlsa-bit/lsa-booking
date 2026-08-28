import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { Card, Badge } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { formatJakarta } from "@/lib/time/timezone";

export default async function ParentDashboardPage() {
  const session = await getSessionProfile();
  const familyId = session!.profile!.family_id!;
  const supabase = await createClient();

  const { data: students } = await supabase.from("students").select("id, name, type").eq("family_id", familyId);
  const studentIds = (students ?? []).map((s) => s.id);

  const [{ data: upcoming }, { data: eligibleMakeups }] = await Promise.all([
    studentIds.length
      ? supabase
          .from("bookings")
          .select("id, type, students(name), slot_instances(starts_at, coaches(name))")
          .in("student_id", studentIds)
          .eq("status", "booked")
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
    studentIds.length
      ? supabase
          .from("missed_sessions")
          .select("id, occurred_at, students(name)")
          .in("student_id", studentIds)
          .eq("notice_given", true)
          .is("makeup_booking_id", null)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-sm text-gray-500">
          {students?.map((s) => s.name).join(", ") || "No students on file yet."}
        </p>
      </div>

      {eligibleMakeups && eligibleMakeups.length > 0 && (
        <Card className="border-lsa-green-mint bg-lsa-green-mint/10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-lsa-green-deep">
                {eligibleMakeups.length} makeup session{eligibleMakeups.length > 1 ? "s" : ""}{" "}
                available to book
              </p>
              <p className="text-sm text-gray-600">
                An excused absence was logged — pick a replacement slot whenever works.
              </p>
            </div>
            <LinkButton href="/parent/book/makeup">Book makeup</LinkButton>
          </div>
        </Card>
      )}

      <div>
        <h2 className="text-sm font-medium text-gray-600 mb-2">Upcoming sessions</h2>
        {upcoming?.length === 0 && <p className="text-sm text-gray-500">No upcoming sessions.</p>}
        <div className="space-y-2">
          {upcoming?.map((b) => {
            const student = b.students as unknown as { name: string } | null;
            const slot = b.slot_instances as unknown as {
              starts_at: string;
              coaches: { name: string } | null;
            } | null;
            return (
              <Card key={b.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{student?.name}</p>
                  <p className="text-sm text-gray-500">
                    {slot ? formatJakarta(slot.starts_at) : "—"}
                    {slot?.coaches ? ` · ${slot.coaches.name}` : ""}
                  </p>
                </div>
                <Badge tone="green">{b.type}</Badge>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
