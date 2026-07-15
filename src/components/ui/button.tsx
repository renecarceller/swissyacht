import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-navy text-white hover:bg-[#0b3156]",
  secondary: "bg-white text-navy border border-[#cbd7e4] hover:border-navy",
  ghost: "text-navy hover:bg-[#e8f3fb]",
  danger: "bg-swiss-red text-white hover:bg-[#be1322]"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn("focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition", variants[variant], className)}
      {...props}
    />
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: keyof typeof variants;
};

export function LinkButton({ className, variant = "primary", ...props }: LinkButtonProps) {
  return (
    <a
      className={cn("focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition", variants[variant], className)}
      {...props}
    />
  );
}
