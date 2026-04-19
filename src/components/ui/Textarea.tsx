import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { hasError = false, className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border bg-white px-3 py-2.5 text-base outline-none transition-colors sm:text-sm dark:bg-[#070f1f] dark:text-white dark:placeholder:text-slate-500",
        hasError
          ? "border-rose-400 focus:border-rose-500 dark:border-rose-600"
          : "border-gray-200 focus:border-blue-400 dark:border-slate-800 dark:focus:border-blue-500",
        className,
      )}
      {...props}
    />
  );
});

export default Textarea;
