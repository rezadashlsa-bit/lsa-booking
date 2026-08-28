import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { NavLinks } from "./NavLinks";

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
    <header className="sticky top-0 z-10 border-b border-lsa-border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lsa-green-deep font-serif text-sm font-semibold text-white">
            L
          </span>
          <div className="leading-tight">
            <p className="font-serif text-sm font-semibold text-lsa-green-deep">
              Lowry Sports Academy
            </p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        </div>
        <nav className="hidden sm:flex items-center gap-1">
          <NavLinks items={items} />
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
      <nav className="sm:hidden flex gap-1 overflow-x-auto px-4 pb-2">
        <NavLinks items={items} mobile />
      </nav>
    </header>
  );
}
