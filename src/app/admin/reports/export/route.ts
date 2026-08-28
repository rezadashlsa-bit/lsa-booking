import { NextResponse, type NextRequest } from "next/server";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";
import { formatJakarta } from "@/lib/time/timezone";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const session = await getSessionProfile();
  if (!session?.profile || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const supabase = await createClient();
  let query = supabase
    .from("bookings")
    .select(
      "type, status, created_at, students(name, type), slot_instances(starts_at, coaches(name))"
    )
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data: bookings, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "Session Date",
    "Session Time (Jakarta)",
    "Student",
    "Student Type",
    "Coach",
    "Booking Type",
    "Status",
    "Booked On",
  ];

  type Row = {
    type: string;
    status: string;
    created_at: string;
    students: { name: string; type: string } | null;
    slot_instances: { starts_at: string; coaches: { name: string } | null } | null;
  };

  const rows = ((bookings ?? []) as unknown as Row[]).map((b) => {
    const slot = b.slot_instances;
    return [
      slot ? formatJakarta(slot.starts_at, "yyyy-MM-dd") : "",
      slot ? formatJakarta(slot.starts_at, "h:mm a") : "",
      b.students?.name ?? "",
      b.students?.type ?? "",
      slot?.coaches?.name ?? "",
      b.type,
      b.status,
      formatJakarta(b.created_at, "yyyy-MM-dd h:mm a"),
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lsa-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
