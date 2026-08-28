import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui/Card";
import { formatJakarta } from "@/lib/time/timezone";

export default async function AdminMissedSessionsPage() {
  const supabase = await createClient();
  const { data: missed } = await supabase
    .from("missed_sessions")
    .select("*, students(name)")
    .order("occurred_at", { ascending: false })
    .limit(150);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Missed Sessions</h1>
        <p className="text-sm text-gray-500">
          Excused (advance-notice) absences are eligible for a makeup booking; no-shows are not.
        </p>
      </div>
      <div className="space-y-2">
        {missed?.length === 0 && <p className="text-sm text-gray-500">None logged yet.</p>}
        {missed?.map((m) => {
          const student = m.students as unknown as { name: string } | null;
          return (
            <Card key={m.id} className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">{student?.name}</p>
                <p className="text-sm text-gray-500">{formatJakarta(m.occurred_at)}</p>
                {m.reason && <p className="text-xs text-gray-400 mt-1">{m.reason}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={m.notice_given ? "green" : "red"}>
                  {m.notice_given ? "Excused" : "No-show"}
                </Badge>
                <Badge tone={m.makeup_booking_id ? "green" : "neutral"}>
                  {m.makeup_booking_id ? "Makeup booked" : m.notice_given ? "Awaiting makeup" : "—"}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
