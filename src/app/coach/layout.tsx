import { requireRole } from "@/lib/auth/require-role";
import { NavBar } from "@/components/layout/NavBar";

const NAV_ITEMS = [
  { href: "/coach", text: "Dashboard" },
  { href: "/coach/availability", text: "Availability" },
  { href: "/coach/bookings", text: "Bookings" },
  { href: "/coach/students", text: "Students" },
];

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("coach");

  return (
    <div className="min-h-full flex flex-col">
      <NavBar label="Coach" email={session.email} items={NAV_ITEMS} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
