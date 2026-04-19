import { cn } from '../lib/utils';
import { ANNOTATION_CAPTURE_MODE } from '../lib/annotationCapture';

/** Matches StudySprint-*-Annotated.html badge colours (CSS variables --teal, --amber, etc.) */
export type CaptureCalloutTone =
  | 'teal'
  | 'amber'
  | 'blue'
  | 'rose'
  | 'green'
  | 'orange'
  | 'violet'
  | 'indigo';

const toneClass: Record<CaptureCalloutTone, string> = {
  teal: 'bg-[#0f766e]',
  amber: 'bg-[#b7791f]',
  blue: 'bg-[#2563eb]',
  rose: 'bg-[#be123c]',
  green: 'bg-[#15803d]',
  orange: 'bg-[#c2410c]',
  violet: 'bg-[#7c3aed]',
  indigo: 'bg-[#4f46e5]',
};

const shellClass =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white font-mono text-[12px] font-extrabold text-white shadow-md dark:border-gray-950';

type CaptureCalloutProps = {
  n: number;
  tone: CaptureCalloutTone;
  className?: string;
  /**
   * `inline` — sits in normal layout (headers, flex rows) so it won’t cover content.
   * `absolute` — parent must be `relative`; use only in gutters / dedicated dead zones.
   */
  variant?: 'absolute' | 'inline';
};

/**
 * Numbered circle for proposal screenshots; aligns with annotated HTML (1–6 per screen).
 */
export function CaptureCallout({
  n,
  tone,
  className,
  variant = 'absolute',
}: CaptureCalloutProps) {
  if (!ANNOTATION_CAPTURE_MODE) return null;

  if (variant === 'inline') {
    return (
      <span
        className={cn(shellClass, toneClass[tone], className)}
        aria-hidden
      >
        {n}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'pointer-events-none absolute z-[35]',
        shellClass,
        toneClass[tone],
        className,
      )}
      aria-hidden
    >
      {n}
    </span>
  );
}
