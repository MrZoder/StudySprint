import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

type AssistTone = "error" | "warning" | "success" | "muted";

const toneClass: Record<AssistTone, string> = {
  error: "text-rose-600 dark:text-rose-400",
  warning: "text-amber-700 dark:text-amber-300",
  success: "text-emerald-700 dark:text-emerald-300",
  muted: "text-gray-500 dark:text-gray-400",
};

interface FormAssistProps {
  id?: string;
  message?: string;
  tone?: AssistTone;
  className?: string;
}

/**
 * Inline validation / helper copy. Use `error` for invalid fields, `warning` for non-blocking cues,
 * `success` for confirmation, `muted` for neutral hints.
 */
export default function FormAssist({ id, message, tone = "muted", className }: FormAssistProps) {
  if (!message) return null;

  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <p
      id={id}
      className={cn(
        "flex items-start gap-1.5 text-xs leading-snug",
        toneClass[tone],
        tone === "muted" && "font-normal",
        className,
      )}
      role={tone === "error" ? "alert" : undefined}
    >
      {tone !== "muted" && <Icon size={12} className="mt-0.5 shrink-0" />}
      <span>{message}</span>
    </p>
  );
}
