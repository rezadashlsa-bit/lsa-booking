"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({
  items,
  mobile = false,
}: {
  items: { href: string; text: string }[];
  mobile?: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const isActive =
          item.href === pathname || (item.href.length > 1 && pathname?.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg font-medium transition-colors whitespace-nowrap ${
              mobile ? "px-3 py-1.5 text-sm" : "px-3 py-2 text-sm"
            } ${
              isActive
                ? "bg-lsa-green-deep text-white"
                : "text-lsa-black/80 hover:bg-lsa-sand/50 hover:text-lsa-black"
            }`}
          >
            {item.text}
          </Link>
        );
      })}
    </>
  );
}
