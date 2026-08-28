import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from "react";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="block text-xs font-medium text-gray-600 mb-1" {...props} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-md border border-lsa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lsa-green-mint"
      {...props}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="w-full rounded-md border border-lsa-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lsa-green-mint"
      {...props}
    />
  );
}
