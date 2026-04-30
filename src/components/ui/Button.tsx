/**
 * Button — the canonical button primitive.
 * Five variants (primary, secondary, danger, dangerFill, ghost) and two sizes
 * cover the entire app. Always renders a real <button>, so callers get the
 * full button HTML attribute surface (form, type, disabled, …) for free.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "dangerFill" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:shadow-[0_16px_30px_-18px_rgba(59,130,246,0.82)] dark:disabled:bg-blue-700/80",
  secondary:
    "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm dark:bg-[#070f1f] dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-900/85",
  danger:
    "border border-red-200 text-red-600 hover:bg-red-50 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/40",
  dangerFill:
    "border border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700 shadow-sm dark:border-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500",
  ghost:
    "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900/85",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-xs rounded-md",
  md: "min-h-11 px-4 py-2.5 text-sm rounded-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {iconLeft}
      {children}
    </button>
  );
}
