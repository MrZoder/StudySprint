/**
 * Landing — public marketing page mounted at "/".
 * -----------------------------------------------------------------------------
 * Single, self-contained page that introduces StudySprint to first-time
 * visitors. Stitches together hero, AI planner spotlight, features, problem/
 * solution, workflow, product showcase, academic impact, team, and footer
 * sections. Visual language is intentionally restrained — single brand accent,
 * solid CTAs, monochrome iconography, and clean typographic hierarchy.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  ListChecks,
  TrendingUp,
  CalendarDays,
  Smartphone,
  Clock,
  AlertCircle,
  CheckCircle2,
  Target,
  Brain,
  Timer,
  GraduationCap,
  Github,
  Linkedin,
  Mail,
  Plus,
  ShieldCheck,
  LineChart,
  Moon,
  Sun,
  FileText,
  Layers,
  Lightbulb,
  Filter,
  Quote,
} from 'lucide-react';
import { useTheme } from '../context/useTheme';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased dark:bg-[#05080f] dark:text-slate-100">
      {/* Subtle dot-grid background — no blurred color blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle,rgba(15,23,42,0.045)_1px,transparent_1px)] [background-size:22px_22px] dark:bg-[radial-gradient(circle,rgba(148,163,184,0.08)_1px,transparent_1px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-white via-white/80 to-transparent dark:from-[#05080f] dark:via-[#05080f]/85"
      />

      <NavBar theme={theme} toggleTheme={toggleTheme} />

      <main>
        <Hero />
        <TrustStrip />
        <AIPlannerSpotlight />
        <Features />
        <WhyStudySprint />
        <HowItWorks />
        <Showcase />
        <AcademicImpact />
        <Team />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}

/* ---------------------------------------------------------------- NAV */

function NavBar({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/70 dark:bg-[#05080f]/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            StudySprint
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
          <a href="#ai-planner" className="transition-colors hover:text-slate-900 dark:hover:text-white">AI planner</a>
          <a href="#features" className="transition-colors hover:text-slate-900 dark:hover:text-white">Features</a>
          <a href="#why" className="transition-colors hover:text-slate-900 dark:hover:text-white">Why StudySprint</a>
          <a href="#how" className="transition-colors hover:text-slate-900 dark:hover:text-white">Workflow</a>
          <a href="#showcase" className="transition-colors hover:text-slate-900 dark:hover:text-white">Product</a>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900/85"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 sm:px-5"
          >
            Launch app
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900">
      <BookMarked size={17} strokeWidth={2.25} />
    </span>
  );
}

/* --------------------------------------------------------------- HERO */

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-24 lg:pt-32">
      <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_1.15fr] lg:gap-16">
        <div>
          <Eyebrow>Student planner · academic workload OS</Eyebrow>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-[64px] dark:text-white">
            Stay ahead of deadlines.
            <span className="block text-slate-500 dark:text-slate-400">Own your study week.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            StudySprint is a student study planner and assignment tracker that brings subjects, tasks, progress,
            and deadlines into one unified system — so you can organise your workload, reduce procrastination,
            and finish the semester with control.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Open the dashboard
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0a1020] dark:text-slate-100 dark:hover:bg-slate-900/85"
            >
              Explore features
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-x-6 gap-y-4 border-t border-slate-200 pt-8 dark:border-slate-800">
            <HeroStat value="6+" label="Subjects tracked" />
            <HeroStat value="100%" label="Offline-first" />
            <HeroStat value="1" label="Unified planner" />
          </dl>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="text-3xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white">{value}</dd>
      <dt className="mt-1.5 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</dt>
    </div>
  );
}

/* --------------------------------------------- HERO DASHBOARD MOCKUP */

function HeroMockup() {
  return (
    <div className="relative">
      <div className="relative rounded-2xl border border-slate-200/90 bg-white shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-[#0a1020] dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
        <BrowserChrome path="studysprint.app / dashboard" />

        <div className="rounded-b-2xl bg-slate-50/80 p-4 sm:p-5 dark:bg-[#070c18]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
                Your study week at a glance
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                2 overdue · 3 due within 4 days · 5 active this week
              </p>
            </div>
            <button className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm dark:bg-white dark:text-slate-900">
              <Plus size={12} />
              New
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <MiniStat label="Total" value="14" tone="neutral" icon={<BookOpen size={14} />} />
            <MiniStat label="Due this week" value="5" tone="warn" icon={<Clock size={14} />} />
            <MiniStat label="Overdue" value="2" tone="alert" icon={<AlertCircle size={14} />} />
            <MiniStat label="Completed" value="9" tone="ok" icon={<CheckCircle2 size={14} />} />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.55fr_1fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-[#0a1020]">
              <div className="mb-2.5 flex items-center gap-1.5">
                <Clock size={13} className="text-amber-600 dark:text-amber-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">Due soon</h4>
              </div>
              <MockAssignment
                subject="COMP3900"
                subjectColor="blue"
                title="Software Engineering Report"
                due="Due in 2 days"
                progress={65}
                tone="urgent"
              />
              <MockAssignment
                subject="DATA2002"
                subjectColor="purple"
                title="Statistical Inference Quiz 3"
                due="Due in 3 days"
                progress={30}
                tone="urgent"
              />
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0a1020]">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-rose-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">Needs attention</h4>
                </div>
                <p className="mt-1.5 text-[10.5px] leading-snug text-slate-600 dark:text-slate-400">
                  2 overdue — open one and finish the smallest subtask first.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0a1020]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">Weekly progress</h4>
                  <span className="text-[10.5px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                    18 / 26
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-slate-900 dark:bg-white" style={{ width: '69%' }} />
                </div>
                <p className="mt-2 text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
                  Strong week — finish the stragglers while you're in flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowserChrome({ path }: { path: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
      <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-700" />
      <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-700" />
      <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-700" />
      <div className="ml-3 hidden rounded-md bg-slate-100 px-3 py-0.5 text-[11px] font-medium text-slate-500 sm:block dark:bg-slate-900 dark:text-slate-400">
        {path}
      </div>
    </div>
  );
}

const miniTone = {
  neutral: 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300',
  warn: 'border-amber-200/80 dark:border-amber-900/40 text-amber-700 dark:text-amber-300',
  alert: 'border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300',
  ok: 'border-emerald-200/80 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300',
} as const;

function MiniStat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: keyof typeof miniTone;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border bg-white p-2.5 dark:bg-[#0a1020] ${miniTone[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</span>
        {icon}
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

const subjectDot = {
  blue: 'bg-blue-500',
  purple: 'bg-violet-500',
  teal: 'bg-teal-500',
  orange: 'bg-orange-500',
} as const;

function MockAssignment({
  subject,
  subjectColor,
  title,
  due,
  progress,
  tone = 'calm',
}: {
  subject: string;
  subjectColor: keyof typeof subjectDot;
  title: string;
  due: string;
  progress: number;
  tone?: 'urgent' | 'calm';
}) {
  return (
    <div className="mb-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 last:mb-0 dark:border-slate-800 dark:bg-[#070c18]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            <span className={`inline-block size-1.5 rounded-full ${subjectDot[subjectColor]}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {subject}
            </span>
          </div>
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{title}</p>
        </div>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
            tone === 'urgent'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {due}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
          <div className="h-full rounded-full bg-slate-900 dark:bg-white" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">{progress}%</span>
      </div>
    </div>
  );
}

/* ----------------------------------------------- AI PLANNER SPOTLIGHT */

function AIPlannerSpotlight() {
  const beats = [
    {
      icon: Brain,
      title: 'Understand the brief',
      desc: 'A plain-language summary that strips out the jargon and tells you what the assignment is actually asking for.',
    },
    {
      icon: ListChecks,
      title: 'Pull out the requirements',
      desc: 'Deliverables, word counts, references, rubric signals — extracted into a checklist you can act on.',
    },
    {
      icon: Layers,
      title: 'A staged action plan',
      desc: 'A realistic sequence of steps from first read to final submission, editable before you save it.',
    },
    {
      icon: CalendarDays,
      title: 'Pacing across the weeks',
      desc: 'A suggested timeline that spreads the work between now and the due date, not the night before.',
    },
    {
      icon: Lightbulb,
      title: 'High-mark focus nudges',
      desc: 'Quality-oriented reminders — rubric mapping, evidence checks, final polish — based on what strong students do.',
    },
    {
      icon: ShieldCheck,
      title: 'Academic-integrity first',
      desc: 'Planning help only. The thinking, writing, and final academic decisions stay with the student — by design.',
    },
  ];

  return (
    <section id="ai-planner" className="relative border-t border-slate-200 py-20 sm:py-28 dark:border-slate-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow centered>AI planner</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[44px] dark:text-white">
            Turn a dense assignment brief
            <span className="block text-slate-500 dark:text-slate-400">into a plan you can actually start.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            Drop in your brief. In seconds, StudySprint surfaces the summary, the requirements,
            a staged plan, and a realistic pacing window — and turns any of it into real
            subtasks inside your planner.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/ai-planner"
              className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Try the AI planner
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#ai-planner-demo"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0a1020] dark:text-slate-100 dark:hover:bg-slate-900/85"
            >
              See how it works
            </a>
          </div>
        </div>

        <div id="ai-planner-demo" className="mt-16 grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <AIPlannerMock />

          <ul className="space-y-3">
            {beats.map((b) => (
              <li
                key={b.title}
                className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-[#0a1020] dark:hover:border-slate-700"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                  <b.icon size={18} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {b.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AIPlannerMock() {
  return (
    <div className="relative">
      <div className="relative rounded-2xl border border-slate-200/90 bg-white shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-[#0a1020] dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
        <BrowserChrome path="studysprint.app / ai-planner" />

        <div className="rounded-b-2xl bg-slate-50/80 p-4 sm:p-5 dark:bg-[#070c18]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0a1020]">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <FileText size={13} />
              Your brief
            </div>
            <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
              Assignment Title: Software Engineering Group Report — Design Proposal. 2,500 words,
              6 IEEE references, submission via Turnitin. Due 15 November. A 10-minute group
              presentation in week 11…
            </p>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0a1020]">
              <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Brain size={11} />
                Summary
              </div>
              <p className="mt-1.5 text-[11.5px] leading-snug text-slate-600 dark:text-slate-400">
                You'll produce a written report and presentation, backed by 6 credible sources
                and marked against a rubric.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0a1020]">
              <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <ListChecks size={11} />
                Requires
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {['2,500 words', 'IEEE refs', 'Rubric', 'Group'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9.5px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0a1020]">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Layers size={11} />
              Action plan · 5 of 8 stages
            </div>
            <ul className="mt-2 space-y-1.5">
              {[
                'Understand the brief',
                'Map the rubric',
                'Gather credible sources',
                'Draft section by section',
                'Rubric self-check before submit',
              ].map((t, i) => (
                <li key={t} className="flex items-center gap-2">
                  <span
                    className={`inline-flex size-4 items-center justify-center rounded border text-[9px] ${
                      i < 2
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                        : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'
                    }`}
                  >
                    {i < 2 ? <CheckCircle2 size={9} /> : ''}
                  </span>
                  <span className="text-[11.5px] text-slate-800 dark:text-slate-200">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {['Plan', 'Research', 'Draft', 'Refine', 'Submit'].map((label, i) => (
              <div
                key={label}
                className="rounded-md border border-slate-200 bg-white p-1.5 text-center dark:border-slate-800 dark:bg-[#0a1020]"
              >
                <div
                  className={`mx-auto h-1 w-6 rounded-full ${
                    i === 0
                      ? 'bg-slate-900 dark:bg-white'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
                <div className="mt-1 text-[9.5px] font-semibold text-slate-700 dark:text-slate-300">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/ai-planner"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Convert to a StudySprint assignment
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- TRUST STRIP */

function TrustStrip() {
  const items = [
    { icon: <ShieldCheck size={14} />, label: 'Works offline' },
    { icon: <LineChart size={14} />, label: 'Progress analytics' },
    { icon: <Target size={14} />, label: 'Deadline-first UX' },
    { icon: <Brain size={14} />, label: 'AI brief breakdown' },
    { icon: <GraduationCap size={14} />, label: 'Made by students' },
  ];
  return (
    <section className="border-y border-slate-200 bg-slate-50/60 py-5 dark:border-slate-800/70 dark:bg-[#070c18]/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center">
              {i > 0 && <span aria-hidden className="mr-8 hidden h-3 w-px bg-slate-300 sm:inline-block dark:bg-slate-700" />}
              <span className="mr-2 text-slate-400 dark:text-slate-500">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- FEATURES */

function Features() {
  const features = [
    {
      icon: Brain,
      title: 'AI brief breakdown',
      desc: 'Paste any assignment brief and StudySprint turns it into a plain-language summary, a requirements checklist, and a staged action plan you can save with one click.',
      preview: (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900/50">
            <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">Brief</span>
            <span className="text-[10px] font-bold text-slate-900 dark:text-white">→ plan</span>
          </div>
          {[
            'Understand the brief',
            'Map the rubric',
            'Gather credible sources',
            'Draft section by section',
          ].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <span className="inline-flex size-3 items-center justify-center rounded-sm border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800" />
              <span className="text-[10px] text-slate-700 dark:text-slate-300">{t}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: LayoutDashboard,
      title: 'Dashboard overview',
      desc: 'A single glance tells you what\'s overdue, what\'s due soon, and what\'s on track — no digging required.',
      preview: (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between rounded-md border border-amber-200/70 bg-amber-50 px-2 py-1.5 dark:border-amber-900/40 dark:bg-amber-950/30">
            <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300">Due soon</span>
            <span className="text-[10px] font-bold tabular-nums text-amber-900 dark:text-amber-200">3</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-rose-200/70 bg-rose-50 px-2 py-1.5 dark:border-rose-900/40 dark:bg-rose-950/30">
            <span className="text-[10px] font-semibold text-rose-800 dark:text-rose-300">Overdue</span>
            <span className="text-[10px] font-bold tabular-nums text-rose-900 dark:text-rose-200">1</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-emerald-200/70 bg-emerald-50 px-2 py-1.5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">Completed</span>
            <span className="text-[10px] font-bold tabular-nums text-emerald-900 dark:text-emerald-200">9</span>
          </div>
        </div>
      ),
    },
    {
      icon: BookOpen,
      title: 'Subjects, in one place',
      desc: 'Organise every unit and course with colour-coded cards. Jump into any subject to see its assignments instantly.',
      preview: (
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { code: 'COMP3900', color: 'bg-blue-500' },
            { code: 'DATA2002', color: 'bg-violet-500' },
            { code: 'INFO2222', color: 'bg-teal-500' },
            { code: 'BUSS1000', color: 'bg-orange-500' },
          ].map((s) => (
            <div
              key={s.code}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-[#0a1020]"
            >
              <span className={`size-1.5 rounded-full ${s.color}`} />
              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{s.code}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: CheckSquare,
      title: 'Assignment tracking',
      desc: 'Capture title, subject, due date, and status. Filter by urgency and get clear visual cues for anything that\'s slipping.',
      preview: (
        <div className="space-y-1.5">
          <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-[#0a1020]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-900 dark:text-white">SWE Report</span>
              <span className="rounded-sm bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                2d
              </span>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-[#0a1020]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-900 dark:text-white">Stats Quiz</span>
              <span className="rounded-sm bg-rose-100 px-1 py-0.5 text-[9px] font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                Late
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: ListChecks,
      title: 'Subtask breakdown',
      desc: 'Split every assignment into bite-sized steps. Big essays stop feeling impossible when you can tick off one part at a time.',
      preview: (
        <div className="space-y-1">
          {[
            { done: true, label: 'Research topic' },
            { done: true, label: 'Outline sections' },
            { done: false, label: 'Draft introduction' },
            { done: false, label: 'Add citations' },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-1.5">
              <span
                className={`inline-flex size-3 items-center justify-center rounded-sm border ${
                  t.done
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                {t.done && <CheckCircle2 size={8} />}
              </span>
              <span
                className={`text-[10px] ${
                  t.done
                    ? 'text-slate-400 line-through dark:text-slate-500'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.label}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: TrendingUp,
      title: 'Progress visualisation',
      desc: 'Each assignment shows a live progress bar based on completed subtasks — real momentum you can actually see.',
      preview: (
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px]">
              <span className="font-medium text-slate-600 dark:text-slate-400">Essay draft</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">75%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-3/4 rounded-full bg-slate-900 dark:bg-white" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px]">
              <span className="font-medium text-slate-600 dark:text-slate-400">Lab report</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">40%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-2/5 rounded-full bg-slate-900 dark:bg-white" />
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: CalendarDays,
      title: 'Calendar planning',
      desc: 'See your whole week on a planner view. Spot clashing deadlines early and reshape your study blocks with a glance.',
      preview: (
        <div className="grid grid-cols-5 gap-1">
          {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
            <div key={i} className="rounded-md border border-slate-200 bg-white p-1 text-center dark:border-slate-800 dark:bg-[#0a1020]">
              <div className="text-[8px] font-semibold text-slate-500 dark:text-slate-400">{d}</div>
              {i === 2 && <div className="mt-0.5 h-1 rounded-sm bg-amber-400" />}
              {i === 4 && <div className="mt-0.5 h-1 rounded-sm bg-rose-400" />}
              {i === 1 && <div className="mt-0.5 h-1 rounded-sm bg-blue-400" />}
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: Smartphone,
      title: 'Cross-device access',
      desc: 'Built as a responsive web app — open StudySprint on laptop, tablet, or phone with the same clean, offline-ready UI.',
      preview: (
        <div className="flex items-end gap-2">
          <div className="rounded-md border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-[#0a1020]">
            <div className="h-6 w-10 rounded-sm bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-[#0a1020]">
            <div className="h-6 w-5 rounded-sm bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-[#0a1020]">
            <div className="h-6 w-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      ),
    },
    {
      icon: Filter,
      title: 'Considered details',
      desc: 'Overdue highlighting, due-soon priority lanes, dark mode, and empty-state nudges — the details that turn a tracker into a tool you actually rely on.',
      preview: (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/50">
            <Moon size={10} className="text-slate-600 dark:text-slate-300" />
            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">Dark mode</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/50">
            <CheckSquare size={10} className="text-slate-600 dark:text-slate-300" />
            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">Keyboard ready</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="border-t border-slate-200 py-20 sm:py-28 dark:border-slate-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Purpose-built for the student workload"
          description="Every screen, every interaction, designed around how university students actually plan, track, and finish their semester."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200/70 sm:grid-cols-2 lg:grid-cols-3 dark:border-slate-800 dark:bg-slate-800/70">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  preview,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  preview: React.ReactNode;
}) {
  return (
    <div className="group relative bg-white p-7 transition-colors hover:bg-slate-50/60 dark:bg-[#070c18] dark:hover:bg-[#0a1020]">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
        <Icon size={19} strokeWidth={2} />
      </span>
      <h3 className="mt-5 text-base font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-[#0a1020]">
        {preview}
      </div>
    </div>
  );
}

/* -------------------------------------------------- WHY STUDYSPRINT */

function WhyStudySprint() {
  const painPoints = [
    'Deadlines scattered across emails, PDFs, and group chats',
    'Multiple apps (calendar, notes, sticky notes) that don\'t talk to each other',
    'No quick sense of what\'s urgent versus what can wait',
    'Big assignments that feel impossible because they\'re one giant task',
  ];
  const solutions = [
    { icon: Target, text: 'Everything in one place — subjects, assignments, subtasks, deadlines' },
    { icon: AlertCircle, text: 'Urgency is built into the UI: overdue, due soon, on track' },
    { icon: ListChecks, text: 'Every assignment breaks down into subtasks you can actually start' },
    { icon: LineChart, text: 'Visual progress means you always know where you stand' },
  ];

  return (
    <section id="why" className="border-t border-slate-200 py-20 sm:py-28 dark:border-slate-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Why StudySprint"
              title="The real problem behind the missed deadline"
              description="University students don't fail because they can't do the work. They fall behind because their planning lives in five different places — and none of them show the whole picture."
            />

            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0a1020]">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                The problem
              </p>
              <ul className="mt-4 space-y-3">
                {painPoints.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 border-l-2 border-rose-300 pl-3 text-sm leading-relaxed text-slate-700 dark:border-rose-800/70 dark:text-slate-300"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:pt-16">
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-[#0a1020]">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                The StudySprint fix
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Centralised academic workload management.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                StudySprint is simpler, more visual, and easier to act on — a single system designed around the way
                real students think about their semester.
              </p>

              <ul className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
                {solutions.map((s) => (
                  <li key={s.text} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                      <s.icon size={16} strokeWidth={2} />
                    </span>
                    <p className="pt-1.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{s.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ HOW IT WORKS */

function HowItWorks() {
  const steps = [
    { icon: BookOpen, title: 'Create subjects', desc: 'Add each unit or course with a colour so your semester is instantly organised.' },
    { icon: CheckSquare, title: 'Add assignments', desc: 'Capture title, subject, description, and due date. Everything lands in one tracker.' },
    { icon: ListChecks, title: 'Break into subtasks', desc: 'Split the work into small, actionable steps you can actually start on today.' },
    { icon: TrendingUp, title: 'Track progress', desc: 'Check off subtasks and watch each assignment\'s live progress bar move forward.' },
    { icon: CalendarDays, title: 'Hit every deadline', desc: 'See due dates on the planner, get visual nudges for urgent work, finish on time.' },
  ];

  return (
    <section id="how" className="border-t border-slate-200 py-20 sm:py-28 dark:border-slate-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Workflow"
          title="A five-step student workflow"
          description="From the first subject you add to the last assignment you submit, StudySprint keeps the flow simple and visual."
        />

        <ol className="mt-14 grid gap-6 lg:grid-cols-5 lg:gap-5">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-[#0a1020] dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tabular-nums tracking-widest text-slate-400 dark:text-slate-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                  <s.icon size={17} strokeWidth={2} />
                </span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- SHOWCASE */

const SHOWCASE_IMAGES = [
  '/DashboardPage-light.png',
  '/DashboardPage-dark.png',
  '/AssignmentsPage-light.png',
  '/AssignmentsPage-dark.png',
  '/SubjectsPage-light.png',
  '/SubjectsPage-dark.png',
];

function Showcase() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    SHOWCASE_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const shots = [
    {
      src: isDark ? '/DashboardPage-dark.png' : '/DashboardPage-light.png',
      title: 'Dashboard',
      tag: 'Home',
      desc: 'One glance, everything in view. Overdue is loud. Due-soon gets its own lane. Progress is always visible.',
      annotations: [
        'Due-soon priority lane',
        'Overdue highlighting',
        'Weekly progress bar',
      ],
    },
    {
      src: isDark ? '/AssignmentsPage-dark.png' : '/AssignmentsPage-light.png',
      title: 'Assignments',
      tag: 'Tracker',
      desc: 'Filter by subject, urgency, or status. Every card shows subject, due date, and live subtask progress.',
      annotations: [
        'Subject colour coding',
        'Status-based filters',
        'Inline subtask progress',
      ],
    },
    {
      src: isDark ? '/SubjectsPage-dark.png' : '/SubjectsPage-light.png',
      title: 'Subjects',
      tag: 'Organisation',
      desc: 'A clean home for every unit on your timetable. Click through to see that subject\'s full assignment queue.',
      annotations: [
        'Per-subject workload',
        'Open-vs-complete ratio',
        'Colour-tagged cards',
      ],
    },
  ];

  return (
    <section id="showcase" className="border-t border-slate-200 py-20 sm:py-28 dark:border-slate-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Inside the app"
          title="The real product, shipped and running"
          description="These are not mockups — they're screenshots of StudySprint today. Open the live app and the same screens are waiting for you."
        />

        <div className="mt-16 space-y-20 lg:space-y-28">
          {shots.map((shot, i) => (
            <div
              key={shot.title}
              className={`grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16 ${
                i % 2 === 1 ? 'lg:[&>div:first-child]:order-2' : ''
              }`}
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-[#0a1020] dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
                <BrowserChrome path={`studysprint.app / ${shot.title.toLowerCase()}`} />
                <img
                  src={shot.src}
                  alt={`StudySprint ${shot.title} page`}
                  className="block w-full rounded-b-xl"
                  loading="lazy"
                />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {shot.tag}
                </span>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  {shot.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">{shot.desc}</p>

                <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {shot.annotations.map((label) => (
                    <li
                      key={label}
                      className="flex items-center gap-3 py-3 text-sm font-medium text-slate-800 dark:text-slate-200"
                    >
                      <CheckCircle2 size={15} className="shrink-0 text-slate-400 dark:text-slate-500" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------- ACADEMIC IMPACT */

function AcademicImpact() {
  const pillars = [
    {
      icon: Timer,
      title: 'Time management',
      desc: 'A clear view of every deadline means students can pace their week — not scramble the night before.',
    },
    {
      icon: Brain,
      title: 'Reduced procrastination',
      desc: 'Subtasks turn overwhelming essays into concrete next steps. Starting is the hardest part, and StudySprint makes it small.',
    },
    {
      icon: GraduationCap,
      title: 'Self-regulated learning',
      desc: 'Visual progress and weekly summaries give students ownership over their learning, not just their calendar.',
    },
  ];

  return (
    <section className="border-t border-slate-200 py-20 sm:py-28 dark:border-slate-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Academic impact"
          title="More than productivity — it's pedagogy"
          description="StudySprint isn't just a nice-looking planner. It's designed to support genuine learning outcomes that matter inside the classroom."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200/70 md:grid-cols-3 dark:border-slate-800 dark:bg-slate-800/70">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="bg-white p-7 dark:bg-[#070c18]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                <p.icon size={19} strokeWidth={2} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>

        <figure className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-[#0a1020] sm:p-12">
          <Quote size={22} className="text-slate-300 dark:text-slate-600" strokeWidth={2} />
          <blockquote className="mt-4 text-xl font-medium leading-relaxed tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            StudySprint supports better time management, reduces procrastination, and encourages self-regulated
            learning — aligning a polished product with the educational rationale behind it.
          </blockquote>
          <figcaption className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              StudySprint design principle
            </span>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-white"
            >
              See it in action
              <ArrowUpRight size={15} />
            </Link>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- TEAM */

function Team() {
  const team = [
    {
      name: 'Zain Zahab',
      role: 'Lead Developer',
      blurb: 'Technical direction, system architecture, and implementation lead.',
      initials: 'ZZ',
    },
    {
      name: 'Ella Ramirez',
      role: 'Frontend & UI',
      blurb: 'Frontend refinement, interface development, and visual improvement.',
      initials: 'ER',
    },
    {
      name: 'Christina Piol',
      role: 'QA & Documentation',
      blurb: 'Frontend refinement, testing, quality review, and documentation support.',
      initials: 'CP',
    },
  ];

  return (
    <section id="team" className="border-t border-slate-200 py-20 sm:py-28 dark:border-slate-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Project team"
          title="Built together, with care"
          description="StudySprint was developed collaboratively as part of the StudySprint software engineering initiative."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200/70 md:grid-cols-3 dark:border-slate-800 dark:bg-slate-800/70">
          {team.map((m) => (
            <div
              key={m.name}
              className="bg-white p-8 dark:bg-[#070c18]"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-base font-semibold tracking-tight text-white dark:bg-white dark:text-slate-900">
                {m.initials}
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{m.name}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {m.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{m.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- FINAL CTA */

function FinalCTA() {
  return (
    <section className="border-t border-slate-200 px-4 pb-24 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8 dark:border-slate-800/70">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-slate-950 p-10 text-center text-white sm:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:22px_22px] opacity-60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
        />
        <div className="relative">
          <Eyebrow tone="dark" centered>Ready when you are</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[44px]">
            Own your study week.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
            Open StudySprint, add your first subject, and see what a unified student planner actually feels like.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              Launch StudySprint
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Review the features
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- FOOTER */

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800/70 dark:bg-[#05080f]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">StudySprint</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                A software engineering initiative
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white">Features</a>
            <a href="#why" className="hover:text-slate-900 dark:hover:text-white">Why</a>
            <a href="#how" className="hover:text-slate-900 dark:hover:text-white">Workflow</a>
            <a href="#showcase" className="hover:text-slate-900 dark:hover:text-white">Product</a>
            <a href="#team" className="hover:text-slate-900 dark:hover:text-white">Team</a>
          </nav>

          <div className="flex items-center gap-2">
            <FooterIcon label="Email"><Mail size={15} /></FooterIcon>
            <FooterIcon label="GitHub"><Github size={15} /></FooterIcon>
            <FooterIcon label="LinkedIn"><Linkedin size={15} /></FooterIcon>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-800/70 dark:text-slate-500">
          © {new Date().getFullYear()} StudySprint · Developed collaboratively by Zain Zahab, Ella Ramirez, and
          Christina Piol.
        </div>
      </div>
    </footer>
  );
}

function FooterIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-[#0a1020] dark:text-slate-400 dark:hover:bg-slate-900/80 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------ SHARED: Eyebrow */

function Eyebrow({
  children,
  centered = false,
  tone = 'light',
}: {
  children: React.ReactNode;
  centered?: boolean;
  tone?: 'light' | 'dark';
}) {
  const justify = centered ? 'justify-center' : '';
  const text =
    tone === 'dark'
      ? 'text-slate-300'
      : 'text-slate-500 dark:text-slate-400';
  const line =
    tone === 'dark'
      ? 'bg-slate-600'
      : 'bg-slate-300 dark:bg-slate-700';
  return (
    <div className={`flex items-center gap-3 ${justify}`}>
      <span aria-hidden className={`h-px w-6 ${line}`} />
      <span className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${text}`}>{children}</span>
      <span aria-hidden className={`h-px w-6 ${line} ${centered ? '' : 'hidden'}`} />
    </div>
  );
}

/* ------------------------------------------------ SHARED: SectionHeading */

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-3xl ${alignCls}`}>
      <Eyebrow centered={align === 'center'}>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[44px] dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">{description}</p>
      )}
    </div>
  );
}
