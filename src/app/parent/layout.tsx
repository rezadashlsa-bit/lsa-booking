import { requireRole } from "@/lib/auth/require-role";
import { NavBar } from "@/components/layout/NavBar";

const NAV_ITEMS = [
  { href: "/parent", text: "Dashboard" },
  { href: "/parent/book/makeup", text: "Book Makeup" },
  { href: "/parent/book/additional", text: "Book Additional" },
  { href: "/parent/book/open", text: "Book Open Hour" },
  { href: "/parent/bookings", text: "My Bookings" },
];

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("parent");

  return (
    <div className="min-h-full flex flex-col">
      <NavBar label="Parent" email={session.email} items={NAV_ITEMS} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
