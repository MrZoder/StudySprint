import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookMarked,
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  ListChecks,
  TrendingUp,
  CalendarDays,
  Smartphone,
  Sparkles,
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
  ChevronRight,
  Zap,
  ShieldCheck,
  LineChart,
  Moon,
  Sun,
  Wand2,
  FileText,
  Layers,
  Lightbulb,
} from 'lucide-react';
import { useTheme } from '../context/useTheme';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-300/45 via-cyan-200/40 to-transparent blur-3xl dark:from-blue-700/30 dark:via-cyan-700/20" />
        <div className="absolute top-[560px] -right-40 h-[420px] w-[560px] rounded-full bg-gradient-to-br from-violet-200/45 via-fuchsia-200/30 to-transparent blur-3xl dark:from-violet-700/25 dark:via-fuchsia-700/15" />
        <div className="absolute top-[1200px] -left-40 h-[380px] w-[520px] rounded-full bg-gradient-to-br from-emerald-200/40 via-teal-200/30 to-transparent blur-3xl dark:from-emerald-700/20 dark:via-teal-700/15" />
      </div>

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
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-md dark:border-blue-950/60 dark:bg-[#020617]/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
            <BookMarked size={18} />
          </span>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight text-gray-900 dark:text-white">StudySprint</div>
            <div className="text-[10px] font-medium tracking-wide text-blue-600/80 dark:text-blue-300/70">
              Student Planner
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-gray-600 md:flex dark:text-slate-300">
          <a href="#ai-planner" className="hover:text-gray-900 dark:hover:text-white">AI planner</a>
          <a href="#features" className="hover:text-gray-900 dark:hover:text-white">Features</a>
          <a href="#why" className="hover:text-gray-900 dark:hover:text-white">Why StudySprint</a>
          <a href="#how" className="hover:text-gray-900 dark:hover:text-white">How it works</a>
          <a href="#showcase" className="hover:text-gray-900 dark:hover:text-white">Product</a>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900/85"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/40 sm:px-5"
          >
            Launch app
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* --------------------------------------------------------------- HERO */

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-20 lg:pt-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_1.15fr] lg:gap-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
            <Sparkles size={13} className="text-blue-500 dark:text-blue-300" />
            Built for university students
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-[64px] dark:text-white">
            Stay ahead of deadlines.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Own your study week.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-slate-300">
            StudySprint is a student study planner and assignment tracker that brings subjects, tasks, progress,
            and deadlines into one unified system — so you can organise your workload, reduce procrastination,
            and finish the semester with control.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
            >
              Open the dashboard
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-white dark:border-slate-800 dark:bg-[#070f1f] dark:text-slate-100 dark:hover:bg-slate-900/85"
            >
              Explore features
            </a>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 sm:gap-6">
            <HeroStat value="6" label="Subjects tracked" />
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
    <div className="border-l-2 border-blue-200 pl-3 dark:border-blue-800">
      <dd className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">{value}</dd>
      <dt className="mt-1 text-xs font-medium leading-snug text-gray-500 sm:text-sm dark:text-slate-400">{label}</dt>
    </div>
  );
}

/* --------------------------------------------- HERO DASHBOARD MOCKUP */

function HeroMockup() {
  return (
    <div className="relative">
      {/* Glow */}
      <div
        aria-hidden
        className="absolute -inset-x-8 -top-6 -bottom-10 rounded-[40px] bg-gradient-to-br from-blue-500/25 via-cyan-400/15 to-transparent blur-3xl dark:from-blue-600/25 dark:via-cyan-500/15"
      />

      <div className="relative rounded-2xl border border-white/70 bg-white/95 p-3 shadow-2xl shadow-blue-900/10 backdrop-blur-sm sm:p-4 dark:border-slate-800 dark:bg-[#030b1a]/95 dark:shadow-[0_40px_80px_-30px_rgba(2,6,23,0.85)]">
        {/* Browser chrome */}
        <div className="mb-3 flex items-center gap-1.5 px-1">
          <span className="size-2.5 rounded-full bg-rose-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-3 hidden rounded-md bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500 sm:block dark:bg-slate-900 dark:text-slate-400">
            studysprint.app / dashboard
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-4 sm:p-5 dark:from-[#030b1a] dark:via-[#050d1b] dark:to-[#071428]">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                Your study week at a glance
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                2 overdue · 3 due within 4 days · 5 active this week
              </p>
            </div>
            <button className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm">
              <Plus size={12} />
              New
            </button>
          </div>

          {/* Stat tiles */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <MiniStat label="Total" value="14" accent="blue" icon={<BookOpen size={14} />} />
            <MiniStat label="Due this week" value="5" accent="amber" icon={<Clock size={14} />} />
            <MiniStat label="Overdue" value="2" accent="rose" icon={<AlertCircle size={14} />} />
            <MiniStat label="Completed" value="9" accent="emerald" icon={<CheckCircle2 size={14} />} />
          </div>

          {/* Due soon + side rail */}
          <div className="mt-4 grid gap-3 lg:grid-cols-[1.55fr_1fr]">
            <div className="rounded-xl border border-amber-200/70 bg-gradient-to-b from-amber-50/80 to-white p-3.5 shadow-sm dark:border-amber-900/40 dark:from-amber-950/25 dark:to-transparent">
              <div className="mb-2.5 flex items-center gap-1.5">
                <Clock size={13} className="text-amber-600 dark:text-amber-400" />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Due soon</h4>
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
              <div className="rounded-xl border-2 border-rose-200 bg-gradient-to-b from-rose-50 to-white p-3 shadow-sm dark:border-rose-900/60 dark:from-rose-950/30 dark:to-transparent">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={13} className="text-rose-500" />
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">Needs attention</h4>
                </div>
                <p className="mt-1 text-[10.5px] leading-snug text-rose-800/90 dark:text-rose-200/80">
                  2 overdue — open one and finish the smallest subtask first.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-[#050d1b]/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Weekly progress</h4>
                  <span className="text-[10.5px] font-semibold tabular-nums text-gray-500 dark:text-slate-400">
                    18 / 26
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: '69%' }}
                  />
                </div>
                <p className="mt-2 text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
                  Strong week — finish the stragglers while you're in flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating accent cards */}
      <div className="absolute -left-4 top-10 hidden rotate-[-6deg] rounded-2xl border border-white/80 bg-white px-3.5 py-2.5 shadow-xl shadow-blue-900/10 md:block dark:border-slate-800 dark:bg-[#050d1b]">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 size={16} />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-gray-900 dark:text-white">Subtask done</p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Draft intro · +5%</p>
          </div>
        </div>
      </div>
      <div className="absolute -right-3 bottom-14 hidden rotate-[5deg] rounded-2xl border border-white/80 bg-white px-3.5 py-2.5 shadow-xl shadow-blue-900/10 md:block dark:border-slate-800 dark:bg-[#050d1b]">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
            <CalendarDays size={16} />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-gray-900 dark:text-white">Next deadline</p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">SWE Report · in 2d</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const miniAccent = {
  blue: 'from-blue-50 to-white border-blue-200/70 text-blue-700 dark:from-blue-950/40 dark:to-transparent dark:border-blue-900/40 dark:text-blue-300',
  amber: 'from-amber-50 to-white border-amber-200/70 text-amber-700 dark:from-amber-950/40 dark:to-transparent dark:border-amber-900/40 dark:text-amber-300',
  rose: 'from-rose-50 to-white border-rose-200/70 text-rose-700 dark:from-rose-950/40 dark:to-transparent dark:border-rose-900/40 dark:text-rose-300',
  emerald: 'from-emerald-50 to-white border-emerald-200/70 text-emerald-700 dark:from-emerald-950/40 dark:to-transparent dark:border-emerald-900/40 dark:text-emerald-300',
} as const;

function MiniStat({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: keyof typeof miniAccent;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border bg-gradient-to-b p-2.5 shadow-sm ${miniAccent[accent]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{label}</span>
        {icon}
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">{value}</p>
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
    <div className="mb-2 rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm last:mb-0 dark:border-slate-800 dark:bg-[#050d1b]/80">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            <span className={`inline-block size-1.5 rounded-full ${subjectDot[subjectColor]}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              {subject}
            </span>
          </div>
          <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{title}</p>
        </div>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
            tone === 'urgent'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {due}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold tabular-nums text-gray-500 dark:text-slate-400">{progress}%</span>
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
    <section
      id="ai-planner"
      className="relative overflow-hidden py-16 sm:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_25%,rgba(139,92,246,0.14),transparent_55%),radial-gradient(circle_at_85%_75%,rgba(34,211,238,0.12),transparent_55%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700 backdrop-blur dark:border-violet-800/70 dark:bg-violet-950/40 dark:text-violet-200">
            <Wand2 size={13} />
            AI planner
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[44px] dark:text-white">
            Turn a dense assignment brief into a{' '}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              plan you can actually start.
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg dark:text-slate-400">
            Drop in your brief. In seconds, StudySprint surfaces the summary, the requirements,
            a staged plan, and a realistic pacing window — and turns any of it into real
            subtasks inside your planner.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/ai-planner"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/40"
            >
              Try the AI planner
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#ai-planner-demo"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-white dark:border-slate-800 dark:bg-[#070f1f] dark:text-slate-100 dark:hover:bg-slate-900/85"
            >
              See how it works
            </a>
          </div>
        </div>

        <div id="ai-planner-demo" className="mt-16 grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <AIPlannerMock />

          <ul className="space-y-4">
            {beats.map((b) => (
              <li
                key={b.title}
                className="group flex items-start gap-4 rounded-2xl border border-gray-200/80 bg-white/95 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg dark:border-slate-800 dark:bg-[#060e1e]/90 dark:hover:border-violet-700/70"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-cyan-500/15 text-violet-600 ring-1 ring-violet-200/70 dark:text-violet-200 dark:ring-violet-800/60">
                  <b.icon size={19} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold tracking-tight text-gray-900 dark:text-white">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-gray-600 dark:text-slate-400">
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
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-violet-500/20 via-fuchsia-400/15 to-cyan-400/15 blur-3xl"
      />
      <div className="relative rounded-2xl border border-white/80 bg-white/95 p-4 shadow-2xl shadow-violet-900/10 backdrop-blur-sm sm:p-5 dark:border-slate-800 dark:bg-[#030b1a]/95 dark:shadow-[0_50px_100px_-40px_rgba(124,58,237,0.55)]">
        <div className="mb-3 flex items-center gap-1.5 px-1">
          <span className="size-2.5 rounded-full bg-rose-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-3 rounded-md bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500 dark:bg-slate-900 dark:text-slate-400">
            studysprint.app / ai-planner
          </div>
        </div>

        {/* Brief chip */}
        <div className="rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/80 via-white to-cyan-50/50 p-4 dark:border-violet-900/40 dark:from-violet-950/25 dark:via-[#060e1e] dark:to-cyan-950/20">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
            <FileText size={13} />
            Your brief
          </div>
          <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-gray-700 dark:text-slate-300">
            Assignment Title: Software Engineering Group Report — Design Proposal. 2,500 words,
            6 IEEE references, submission via Turnitin. Due 15 November. A 10-minute group
            presentation in week 11…
          </p>
        </div>

        {/* Output rows */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-[#050d1b]/80">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
              <Brain size={11} />
              Summary
            </div>
            <p className="mt-1.5 text-[11.5px] leading-snug text-gray-600 dark:text-slate-400">
              You'll produce a written report and presentation, backed by 6 credible sources
              and marked against a rubric.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-[#050d1b]/80">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
              <ListChecks size={11} />
              Requires
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {['2,500 words', 'IEEE refs', 'Rubric', 'Group'].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-cyan-100 px-2 py-0.5 text-[9.5px] font-semibold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action plan */}
        <div className="mt-3 rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/15">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Layers size={11} />
            Action plan (5 of 8 stages)
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
                  className={`inline-flex size-4 items-center justify-center rounded-sm border text-[9px] ${
                    i < 2
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-emerald-300 bg-white dark:border-emerald-700 dark:bg-slate-900'
                  }`}
                >
                  {i < 2 ? <CheckCircle2 size={9} /> : ''}
                </span>
                <span className="text-[11.5px] text-gray-800 dark:text-slate-200">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Timeline */}
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {[
            { label: 'Plan', tone: 'from-violet-500 to-violet-600' },
            { label: 'Research', tone: 'from-fuchsia-500 to-fuchsia-600' },
            { label: 'Draft', tone: 'from-blue-500 to-blue-600' },
            { label: 'Refine', tone: 'from-cyan-500 to-cyan-600' },
            { label: 'Submit', tone: 'from-emerald-500 to-emerald-600' },
          ].map((p) => (
            <div
              key={p.label}
              className="rounded-md border border-gray-200 bg-white p-1.5 text-center shadow-sm dark:border-slate-800 dark:bg-[#050d1b]"
            >
              <div className={`mx-auto h-1 w-6 rounded-full bg-gradient-to-r ${p.tone}`} />
              <div className="mt-1 text-[9.5px] font-semibold text-gray-700 dark:text-slate-300">
                {p.label}
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/ai-planner"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 px-3 py-2.5 text-[12px] font-semibold text-white shadow-md shadow-violet-500/30 transition-all hover:shadow-lg"
        >
          Convert to a StudySprint assignment
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- TRUST STRIP */

function TrustStrip() {
  const items = [
    { icon: <ShieldCheck size={15} />, label: 'Works offline' },
    { icon: <Zap size={15} />, label: 'Instant sync' },
    { icon: <LineChart size={15} />, label: 'Progress analytics' },
    { icon: <Target size={15} />, label: 'Deadline-first UX' },
    { icon: <GraduationCap size={15} />, label: 'Made by students' },
  ];
  return (
    <section className="border-y border-gray-200/70 bg-white/60 py-6 backdrop-blur-sm dark:border-blue-950/60 dark:bg-[#040a18]/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm font-medium text-gray-500 dark:text-slate-400">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-blue-500 dark:text-blue-400">{item.icon}</span>
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
      icon: Wand2,
      title: 'AI brief breakdown',
      desc: 'Paste any assignment brief and StudySprint turns it into a plain-language summary, a requirements checklist, and a staged action plan you can save with one click.',
      accent: 'violet',
      preview: (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between rounded-md bg-violet-50 px-2 py-1.5 dark:bg-violet-950/40">
            <span className="text-[10px] font-semibold text-violet-800 dark:text-violet-200">Brief</span>
            <span className="text-[10px] font-bold text-violet-900 dark:text-violet-100">→ plan</span>
          </div>
          {[
            'Understand the brief',
            'Map the rubric',
            'Gather credible sources',
            'Draft section by section',
          ].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <span className="inline-flex size-3 items-center justify-center rounded-sm border border-violet-400 bg-white dark:border-violet-600 dark:bg-slate-800" />
              <span className="text-[10px] text-gray-700 dark:text-slate-300">{t}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: LayoutDashboard,
      title: 'Dashboard overview',
      desc: 'A single glance tells you what\'s overdue, what\'s due soon, and what\'s on track — no digging required.',
      accent: 'blue',
      preview: (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between rounded-md bg-amber-50 px-2 py-1.5 dark:bg-amber-950/40">
            <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300">Due soon</span>
            <span className="text-[10px] font-bold tabular-nums text-amber-900 dark:text-amber-200">3</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-rose-50 px-2 py-1.5 dark:bg-rose-950/40">
            <span className="text-[10px] font-semibold text-rose-800 dark:text-rose-300">Overdue</span>
            <span className="text-[10px] font-bold tabular-nums text-rose-900 dark:text-rose-200">1</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1.5 dark:bg-emerald-950/40">
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
      accent: 'violet',
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
              className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-[#050d1b]"
            >
              <span className={`size-1.5 rounded-full ${s.color}`} />
              <span className="text-[10px] font-semibold text-gray-700 dark:text-slate-300">{s.code}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: CheckSquare,
      title: 'Assignment tracking',
      desc: 'Capture title, subject, due date, and status. Filter by urgency and get clear visual cues for anything that\'s slipping.',
      accent: 'amber',
      preview: (
        <div className="space-y-1.5">
          <div className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-[#050d1b]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-900 dark:text-white">SWE Report</span>
              <span className="rounded-sm bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                2d
              </span>
            </div>
          </div>
          <div className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-[#050d1b]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-900 dark:text-white">Stats Quiz</span>
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
      accent: 'teal',
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
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                }`}
              >
                {t.done && <CheckCircle2 size={8} />}
              </span>
              <span
                className={`text-[10px] ${
                  t.done
                    ? 'text-gray-400 line-through dark:text-slate-500'
                    : 'text-gray-700 dark:text-slate-300'
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
      accent: 'emerald',
      preview: (
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px]">
              <span className="font-medium text-gray-600 dark:text-slate-400">Essay draft</span>
              <span className="font-semibold tabular-nums text-gray-900 dark:text-white">75%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px]">
              <span className="font-medium text-gray-600 dark:text-slate-400">Lab report</span>
              <span className="font-semibold tabular-nums text-gray-900 dark:text-white">40%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: CalendarDays,
      title: 'Calendar planning',
      desc: 'See your whole week on a planner view. Spot clashing deadlines early and reshape your study blocks with a glance.',
      accent: 'sky',
      preview: (
        <div className="grid grid-cols-5 gap-1">
          {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
            <div key={i} className="rounded-md border border-gray-200 bg-white p-1 text-center dark:border-slate-800 dark:bg-[#050d1b]">
              <div className="text-[8px] font-semibold text-gray-500 dark:text-slate-400">{d}</div>
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
      accent: 'cyan',
      preview: (
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-gray-200 bg-white p-1.5 dark:border-slate-800 dark:bg-[#050d1b]">
            <div className="h-6 w-10 rounded-sm bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-950/60 dark:to-cyan-950/40" />
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-1.5 dark:border-slate-800 dark:bg-[#050d1b]">
            <div className="h-6 w-5 rounded-sm bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-950/60 dark:to-cyan-950/40" />
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-1.5 dark:border-slate-800 dark:bg-[#050d1b]">
            <div className="h-6 w-3 rounded-sm bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-950/60 dark:to-cyan-950/40" />
          </div>
        </div>
      ),
    },
    {
      icon: Sparkles,
      title: 'Thoughtful detail',
      desc: 'Overdue highlighting, due-soon priority lanes, dark mode, and empty-state nudges — it\'s the small things that make it feel real.',
      accent: 'fuchsia',
      preview: (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 rounded-md bg-fuchsia-50 px-2 py-1 dark:bg-fuchsia-950/40">
            <Sparkles size={10} className="text-fuchsia-600 dark:text-fuchsia-300" />
            <span className="text-[10px] font-medium text-fuchsia-800 dark:text-fuchsia-200">Dark mode</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 dark:bg-blue-950/40">
            <Zap size={10} className="text-blue-600 dark:text-blue-300" />
            <span className="text-[10px] font-medium text-blue-800 dark:text-blue-200">Keyboard ready</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading
        eyebrow="Features"
        title="Purpose-built for the student workload"
        description="Every screen, every interaction, designed around how university students actually plan, track, and finish their semester."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}

const accentStyles: Record<string, { chip: string; ring: string }> = {
  blue: { chip: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300', ring: 'from-blue-500/20 to-transparent' },
  violet: { chip: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300', ring: 'from-violet-500/20 to-transparent' },
  amber: { chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', ring: 'from-amber-500/20 to-transparent' },
  teal: { chip: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300', ring: 'from-teal-500/20 to-transparent' },
  emerald: { chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', ring: 'from-emerald-500/20 to-transparent' },
  sky: { chip: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300', ring: 'from-sky-500/20 to-transparent' },
  cyan: { chip: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300', ring: 'from-cyan-500/20 to-transparent' },
  fuchsia: { chip: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-300', ring: 'from-fuchsia-500/20 to-transparent' },
};

function FeatureCard({
  icon: Icon,
  title,
  desc,
  accent,
  preview,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  accent: string;
  preview: React.ReactNode;
}) {
  const a = accentStyles[accent] ?? accentStyles.blue;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/10 dark:border-slate-800 dark:bg-[#060e1e]/90 dark:hover:border-blue-900/70 dark:hover:shadow-[0_30px_60px_-30px_rgba(59,130,246,0.4)]">
      <div
        aria-hidden
        className={`absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br ${a.ring} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative">
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${a.chip}`}>
          <Icon size={20} />
        </span>
        <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400">{desc}</p>

        <div className="mt-5 rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-50 to-white p-3 dark:border-slate-800 dark:from-[#030a17] dark:to-[#050d1b]">
          {preview}
        </div>
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
    <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Why StudySprint"
            title="The real problem behind the missed deadline"
            description="University students don't fail because they can't do the work. They fall behind because their planning lives in five different places — and none of them show the whole picture."
          />

          <div className="mt-8 rounded-2xl border border-rose-200/70 bg-gradient-to-b from-rose-50/70 to-white p-5 dark:border-rose-900/40 dark:from-rose-950/20 dark:to-transparent">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              The problem
            </p>
            <ul className="mt-3 space-y-2.5">
              {painPoints.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-slate-300">
                  <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-rose-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:pt-14">
          <div className="relative rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50 via-white to-cyan-50/60 p-6 shadow-lg shadow-blue-900/5 sm:p-8 dark:border-blue-900/50 dark:from-blue-950/30 dark:via-[#060e1e] dark:to-cyan-950/20 dark:shadow-[0_30px_60px_-30px_rgba(59,130,246,0.4)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              The StudySprint fix
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Centralised academic workload management.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
              StudySprint is simpler, more visual, and easier to act on — a single system designed around the way
              real students think about their semester.
            </p>

            <div className="mt-6 space-y-3.5">
              {solutions.map((s) => (
                <div
                  key={s.text}
                  className="flex items-start gap-3 rounded-xl border border-white/90 bg-white/95 p-3.5 shadow-sm dark:border-slate-800 dark:bg-[#050d1b]/80"
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30">
                    <s.icon size={16} />
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-gray-800 dark:text-slate-200">{s.text}</p>
                </div>
              ))}
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
    <section id="how" className="relative overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="A five-step student workflow"
          description="From the first subject you add to the last assignment you submit, StudySprint keeps the flow simple and visual."
        />

        <div className="relative mt-14">
          {/* Connector line (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[30px] hidden h-[2px] bg-gradient-to-r from-transparent via-blue-300/70 to-transparent lg:block dark:via-blue-800/60"
          />

          <ol className="grid gap-6 lg:grid-cols-5 lg:gap-5">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-[#060e1e]/90 dark:hover:border-blue-900/70">
                  <span className="relative mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
                    <s.icon size={22} />
                    <span className="absolute -bottom-2 -right-2 inline-flex size-6 items-center justify-center rounded-full border-2 border-white bg-white text-[11px] font-bold text-blue-700 shadow-md dark:border-[#060e1e] dark:bg-[#060e1e] dark:text-blue-300">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-slate-400">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight
                    aria-hidden
                    size={20}
                    className="absolute -right-3 top-6 hidden text-blue-400/80 lg:block dark:text-blue-600"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
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

  // Preload the opposite theme's images once so toggling feels instant
  useEffect(() => {
    SHOWCASE_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const shots = [
    {
      src: isDark ? '/DashboardPage-dark.png' : '/DashboardPage-light.png',
      srcLight: '/DashboardPage-light.png',
      srcDark: '/DashboardPage-dark.png',
      title: 'Dashboard',
      tag: 'Home',
      desc: 'One glance, everything in view. Overdue is loud. Due-soon gets its own lane. Progress is always visible.',
      annotations: [
        { label: 'Due-soon priority lane' },
        { label: 'Overdue highlighting' },
        { label: 'Weekly progress bar' },
      ],
    },
    {
      src: isDark ? '/AssignmentsPage-dark.png' : '/AssignmentsPage-light.png',
      srcLight: '/AssignmentsPage-light.png',
      srcDark: '/AssignmentsPage-dark.png',
      title: 'Assignments',
      tag: 'Tracker',
      desc: 'Filter by subject, urgency, or status. Every card shows subject, due date, and live subtask progress.',
      annotations: [
        { label: 'Subject colour coding' },
        { label: 'Status-based filters' },
        { label: 'Inline subtask progress' },
      ],
    },
    {
      src: isDark ? '/SubjectsPage-dark.png' : '/SubjectsPage-light.png',
      srcLight: '/SubjectsPage-light.png',
      srcDark: '/SubjectsPage-dark.png',
      title: 'Subjects',
      tag: 'Organisation',
      desc: 'A clean home for every unit on your timetable. Click through to see that subject\'s full assignment queue.',
      annotations: [
        { label: 'Per-subject workload' },
        { label: 'Open-vs-complete ratio' },
        { label: 'Colour-tagged cards' },
      ],
    },
  ];

  return (
    <section id="showcase" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Inside the app"
          title="The real product, shipped and running"
          description="These are not mockups — they're screenshots of StudySprint today. Open the live app and the same screens are waiting for you."
        />

        <div className="mt-14 space-y-16 lg:space-y-20">
          {shots.map((shot, i) => (
            <div
              key={shot.title}
              className={`grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14 ${
                i % 2 === 1 ? 'lg:[&>div:first-child]:order-2' : ''
              }`}
            >
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-transparent blur-3xl"
                />
                <div className="relative rounded-2xl border border-white/80 bg-white/80 p-2 shadow-2xl shadow-blue-900/15 backdrop-blur dark:border-slate-800 dark:bg-[#030b1a]/90 dark:shadow-[0_50px_100px_-40px_rgba(2,6,23,0.85)]">
                  <div className="mb-2 flex items-center gap-1.5 px-1.5 pt-1">
                    <span className="size-2 rounded-full bg-rose-400/80" />
                    <span className="size-2 rounded-full bg-amber-400/80" />
                    <span className="size-2 rounded-full bg-emerald-400/80" />
                    <div className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-slate-900 dark:text-slate-400">
                      studysprint.app / {shot.title.toLowerCase()}
                    </div>
                  </div>
                  <img
                    src={shot.src}
                    alt={`StudySprint ${shot.title} page`}
                    className="block w-full rounded-xl border border-gray-100 dark:border-slate-800"
                    loading="lazy"
                  />
                </div>
              </div>

              <div>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {shot.tag}
                </span>
                <h3 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                  {shot.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-slate-400">{shot.desc}</p>

                <ul className="mt-6 space-y-2.5">
                  {shot.annotations.map((a) => (
                    <li
                      key={a.label}
                      className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 shadow-sm dark:border-slate-800 dark:bg-[#060e1e]/80 dark:text-slate-200"
                    >
                      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow">
                        <CheckCircle2 size={13} />
                      </span>
                      {a.label}
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
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Academic impact"
          title="More than productivity — it's pedagogy"
          description="StudySprint isn't just a nice-looking planner. It's designed to support genuine learning outcomes that matter inside the classroom."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-[#060e1e]/90 dark:hover:shadow-[0_30px_60px_-30px_rgba(59,130,246,0.4)]"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
                <p.icon size={22} />
              </span>
              <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-gray-600 dark:text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-600 to-cyan-500 p-8 text-white shadow-xl shadow-blue-500/25 sm:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <p className="text-lg font-medium leading-relaxed sm:text-xl">
              StudySprint supports better time management, reduces procrastination, and encourages self-regulated
              learning — aligning a polished product with the educational rationale behind it.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-transform hover:scale-[1.02]"
            >
              See it in action
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
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
      gradient: 'from-blue-600 to-cyan-500',
    },
    {
      name: 'Ella Ramirez',
      role: 'Frontend & UI',
      blurb: 'Frontend refinement, interface development, and visual improvement.',
      initials: 'ER',
      gradient: 'from-violet-600 to-fuchsia-500',
    },
    {
      name: 'Christina Piol',
      role: 'QA & Documentation',
      blurb: 'Frontend refinement, testing, quality review, and documentation support.',
      initials: 'CP',
      gradient: 'from-emerald-600 to-teal-500',
    },
  ];

  return (
    <section id="team" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading
        eyebrow="Project Team"
        title="Built together, with care"
        description="StudySprint was developed collaboratively as part of the StudySprint software engineering initiative."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {team.map((m) => (
          <div
            key={m.name}
            className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-7 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-[#060e1e]/90 dark:hover:shadow-[0_30px_60px_-30px_rgba(59,130,246,0.4)]"
          >
            <div className="relative mx-auto">
              <span
                className={`mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${m.gradient} text-2xl font-bold text-white shadow-lg shadow-blue-500/20`}
              >
                {m.initials}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-bold tracking-tight text-gray-900 dark:text-white">{m.name}</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300">
              {m.role}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-400">{m.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- FINAL CTA */

function FinalCTA() {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-200/70 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 p-10 text-center text-white shadow-2xl shadow-blue-900/30 sm:p-14 dark:border-blue-900/60">
        <div
          aria-hidden
          className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-blue-400/30 blur-3xl"
        />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to own your study week?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-blue-100 sm:text-lg">
            Open StudySprint, add your first subject, and see what a unified student planner actually feels like.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-blue-700 shadow-xl transition-transform hover:scale-[1.02]"
            >
              Launch StudySprint
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
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
    <footer className="border-t border-gray-200/80 bg-white/80 backdrop-blur-sm dark:border-blue-950/60 dark:bg-[#020617]/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
              <BookMarked size={18} />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-gray-900 dark:text-white">StudySprint</div>
              <div className="text-[11px] text-gray-500 dark:text-slate-400">
                A software engineering initiative
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-gray-600 dark:text-slate-400">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white">Features</a>
            <a href="#why" className="hover:text-gray-900 dark:hover:text-white">Why</a>
            <a href="#how" className="hover:text-gray-900 dark:hover:text-white">How</a>
            <a href="#showcase" className="hover:text-gray-900 dark:hover:text-white">Product</a>
            <a href="#team" className="hover:text-gray-900 dark:hover:text-white">Team</a>
          </nav>

          <div className="flex items-center gap-2">
            <FooterIcon label="Email"><Mail size={16} /></FooterIcon>
            <FooterIcon label="GitHub"><Github size={16} /></FooterIcon>
            <FooterIcon label="LinkedIn"><Linkedin size={16} /></FooterIcon>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200/80 pt-6 text-center text-xs text-gray-500 dark:border-blue-950/60 dark:text-slate-500">
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
      className="inline-flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-slate-800 dark:bg-[#060e1e] dark:text-slate-400 dark:hover:bg-slate-900/80 dark:hover:text-white"
    >
      {children}
    </button>
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
      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[44px] dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg dark:text-slate-400">{description}</p>
      )}
    </div>
  );
}
