import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 px-4 py-2.5 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

const variants = {
  primary:
    "bg-lsa-green-deep text-white shadow-sm hover:bg-lsa-black hover:shadow-md",
  secondary:
    "bg-white border border-lsa-border text-lsa-black hover:border-lsa-green-sage hover:text-lsa-green-deep",
  ghost: "text-lsa-green-deep hover:bg-lsa-sand/40",
  danger: "bg-white border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300",
};

type Variant = keyof typeof variants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className = "",
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string }) {
  return <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
