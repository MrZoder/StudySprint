import { AlertCircle } from "lucide-react";

interface ValidationMessageProps {
  message?: string;
}

export default function ValidationMessage({ message }: ValidationMessageProps) {
  if (!message) return null;

  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
      <AlertCircle size={12} />
      {message}
    </p>
  );
}
