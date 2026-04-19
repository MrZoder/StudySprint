import type { Subject } from "../../types";
import { getSubjectTheme } from "../../lib/subjectStyles";
import { cn } from "../../lib/utils";

interface SubjectPillProps {
  subject?: Subject;
}

export default function SubjectPill({ subject }: SubjectPillProps) {
  if (!subject) return null;
  const theme = getSubjectTheme(subject);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm shadow-slate-950/[0.03] backdrop-blur-sm",
        theme.badge,
      )}
    >
      <div className={cn("h-2 w-2 rounded-full", theme.dot)} />
      <span className="text-[11px] font-semibold tracking-wide">{subject.code}</span>
    </div>
  );
}
