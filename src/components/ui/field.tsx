import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#21354b]">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("focus-ring h-11 rounded-md border border-[#cbd7e4] bg-white px-3 text-sm", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("focus-ring h-11 rounded-md border border-[#cbd7e4] bg-white px-3 text-sm", props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("focus-ring min-h-32 rounded-md border border-[#cbd7e4] bg-white px-3 py-2 text-sm", props.className)} />;
}
