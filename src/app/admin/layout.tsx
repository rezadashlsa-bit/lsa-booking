import { requireRole } from "@/lib/auth/require-role";
import { NavBar } from "@/components/layout/NavBar";

const NAV_ITEMS = [
  { href: "/admin", text: "Dashboard" },
  { href: "/admin/coaches", text: "Coaches" },
  { href: "/admin/families", text: "Families" },
  { href: "/admin/students", text: "Students" },
  { href: "/admin/availability", text: "Availability" },
  { href: "/admin/bookings", text: "Bookings" },
  { href: "/admin/missed-sessions", text: "Missed Sessions" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("admin");

  return (
    <div className="min-h-full flex flex-col">
      <NavBar label="Admin" email={session.email} items={NAV_ITEMS} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
