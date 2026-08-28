import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import type { BookingType, BookingStatus } from "@/lib/supabase/database.types";

const TYPE_LABEL: Record<BookingType, string> = {
  makeup: "Makeup",
  additional: "Additional",
  open_hour: "Open Hour",
};

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase.from("bookings").select("type, status");

  const byType: Record<BookingType, number> = { makeup: 0, additional: 0, open_hour: 0 };
  const byStatus: Record<BookingStatus, number> = {
    booked: 0,
    completed: 0,
    missed: 0,
    cancelled: 0,
  };
  for (const b of bookings ?? []) {
    byType[b.type as BookingType]++;
    byStatus[b.status as BookingStatus]++;
  }
  const total = bookings?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="text-sm text-gray-500">
          Booking activity summary and CSV export for accounting/reconciliation.
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-medium mb-3">Export</h2>
        <p className="text-sm text-gray-500 mb-3">
          Download every booking on record (date, student, coach, type, status) as a CSV file
          ready for Excel.
        </p>
        <LinkButton href="/admin/reports/export">Download CSV</LinkButton>
      </Card>

      <div>
        <h2 className="text-sm font-medium text-gray-600 mb-2">By type ({total} total)</h2>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(byType) as [BookingType, number][]).map(([type, count]) => (
            <Card key={type} className="text-center">
              <p className="text-2xl font-semibold text-lsa-green-deep">{count}</p>
              <Badge className="mt-1">{TYPE_LABEL[type]}</Badge>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-gray-600 mb-2">By status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(byStatus) as [BookingStatus, number][]).map(([status, count]) => (
            <Card key={status} className="text-center">
              <p className="text-2xl font-semibold text-lsa-green-deep">{count}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{status}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
