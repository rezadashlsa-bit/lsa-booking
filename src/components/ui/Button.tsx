import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors px-4 py-2.5 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-lsa-green-deep text-white hover:bg-lsa-black",
  secondary: "bg-white border border-lsa-border text-lsa-black hover:border-lsa-green-sage",
  ghost: "text-lsa-green-deep hover:bg-lsa-sand/40",
  danger: "bg-white border border-red-200 text-red-700 hover:bg-red-50",
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
