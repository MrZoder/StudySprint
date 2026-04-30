/**
 * Input — text input primitive with light/dark + error styling.
 * `forwardRef` so forms can imperatively focus, validate, or scroll into
 * view. `hasError` flips the border tone but doesn't render the message —
 * pair with <ValidationMessage> for that.
 */
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError = false, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "min-h-11 rounded-lg border bg-white px-3 py-2.5 text-base outline-none transition-colors sm:text-sm dark:bg-[#070f1f] dark:text-white dark:placeholder:text-slate-500",
        hasError
          ? "border-rose-400 focus:border-rose-500 dark:border-rose-600"
          : "border-gray-200 focus:border-blue-400 dark:border-slate-800 dark:focus:border-blue-500",
        className,
      )}
      {...props}
    />
  );
});

export default Input;
