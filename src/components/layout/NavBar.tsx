import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function NavBar({
  label,
  email,
  items,
}: {
  label: string;
  email: string;
  items: { href: string; text: string }[];
}) {
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <header className="border-b border-lsa-border bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-lsa-green-deep font-semibold">LSA</span>
          <span className="text-sm text-gray-500">{label}</span>
        </div>
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-md hover:bg-lsa-sand/40 text-lsa-black"
            >
              {item.text}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-gray-400 truncate max-w-[160px]">
            {email}
          </span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" className="!px-3 !py-1.5 text-xs">
              Sign out
            </Button>
          </form>
        </div>
      </div>
      <nav className="sm:hidden flex gap-1 overflow-x-auto px-4 pb-2 text-sm">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-1.5 rounded-md hover:bg-lsa-sand/40 whitespace-nowrap"
          >
            {item.text}
          </Link>
        ))}
      </nav>
    </header>
  );
}
