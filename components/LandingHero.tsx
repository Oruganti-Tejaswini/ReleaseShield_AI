import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Braces,
  CheckCircle2,
  DatabaseZap,
  FileCode2,
  GitPullRequest,
  Radar,
  ShieldCheck,
  Sparkles,
  Wrench
} from "lucide-react";

const paths = [
  {
    title: "Audit PR Analysis",
    href: "/analyze?mode=audit",
    icon: GitPullRequest,
    accent: "bg-reef text-white",
    surface: "bg-[radial-gradient(circle_at_top_left,rgba(0,159,157,.20),transparent_38%),linear-gradient(135deg,#ffffff,#f0fffe)]",
    rail: "from-reef/20 via-reef to-reef/20",
    body: "Scan PR link, description, and changed code for risk, leakage, and release readiness.",
    steps: ["Read PR evidence", "Detect risk and leaks", "Prompt update flow"]
  },
  {
    title: "Fix Coding Issues",
    href: "/analyze?mode=fix",
    icon: Wrench,
    accent: "bg-signal text-ink",
    surface: "bg-[radial-gradient(circle_at_top_left,rgba(240,180,41,.24),transparent_38%),linear-gradient(135deg,#ffffff,#fff9e8)]",
    rail: "from-signal/20 via-signal to-signal/20",
    body: "Choose a language, upload code/logs/comments, validate syntax, and get reviewable fixes.",
    steps: ["Parse language", "Validate code health", "Suggest safe fix"]
  },
  {
    title: "CSV Crawler & Insights",
    href: "/data-detective",
    icon: DatabaseZap,
    accent: "bg-violet text-white",
    surface: "bg-[radial-gradient(circle_at_top_left,rgba(108,92,231,.22),transparent_38%),linear-gradient(135deg,#ffffff,#f4f2ff)]",
    rail: "from-violet/20 via-violet to-violet/20",
    body: "Upload CSV/XLSX files, profile data quality, detect issues, and generate charts.",
    steps: ["Crawl spreadsheet", "Score data quality", "Explain insights"]
  }
];

const orbitNodes = [
  ["PR", GitPullRequest, "top-[8%] left-[44%]", "bg-reef"],
  ["Code", FileCode2, "top-[39%] right-[4%]", "bg-signal"],
  ["Data", BarChart3, "bottom-[8%] left-[43%]", "bg-violet"],
  ["Shield", ShieldCheck, "top-[40%] left-[4%]", "bg-emerald-500"]
];

export function LandingHero() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-ink">
      <section className="relative min-h-screen border-b border-ink/10 bg-[#10131a] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] bg-[size:46px_46px]" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-reef/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-violet/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 py-6 sm:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-reef text-white shadow-soft">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <span className="text-lg font-bold">ReleaseShield AI</span>
                <p className="text-xs font-semibold uppercase text-white/45">Production safety + data intelligence</p>
              </div>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_520px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/10 px-3 py-2 text-sm font-bold backdrop-blur">
                <Sparkles className="h-4 w-4 text-signal" />
                One workspace for release safety, code rescue, and data insight
              </div>
              <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-tight tracking-normal sm:text-7xl">
                ReleaseShield AI
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
                A judge-ready AI control room that audits PRs, fixes broken code with language-aware validation,
                and turns messy spreadsheets into trusted business recommendations.
              </p>

              <div className="mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
                {paths.map((path) => {
                  const Icon = path.icon;
                  return (
                    <a
                      key={path.title}
                      href="#paths"
                      className="group rounded-md border border-white/14 bg-white/[0.09] p-4 text-left shadow-[0_24px_80px_rgba(0,0,0,.22)] backdrop-blur transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.14]"
                    >
                      <span className={`grid h-12 w-12 place-items-center rounded-md ${path.accent}`}>
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="mt-4 flex items-center justify-between gap-3 text-xl font-bold">
                        {path.title}
                        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-white/65">{path.body}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="relative mx-auto h-[520px] w-full max-w-[520px]">
              <div className="absolute inset-8 rounded-full border border-white/12 bg-white/[0.04] shadow-[inset_0_0_60px_rgba(255,255,255,.05)]" />
              <div className="absolute inset-20 rounded-full border border-dashed border-white/18" />
              <div className="absolute inset-[138px] rounded-full border border-white/12 bg-ink/80 backdrop-blur-xl" />

              <div className="absolute left-1/2 top-1/2 z-10 w-48 -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/14 bg-white/10 p-4 text-center shadow-[0_30px_90px_rgba(0,0,0,.35)] backdrop-blur">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-white text-ink">
                  <Radar className="h-7 w-7 text-reef" />
                </span>
                <p className="mt-3 text-lg font-bold">AI Mission Core</p>
                <p className="mt-1 text-xs leading-5 text-white/55">Agents route evidence into decisions, fixes, and insights.</p>
              </div>

              {orbitNodes.map(([label, Icon, position, color]) => (
                <div key={label as string} className={`absolute ${position as string}`}>
                  <div className="rounded-md border border-white/14 bg-white/12 p-3 shadow-[0_18px_50px_rgba(0,0,0,.28)] backdrop-blur">
                    <span className={`grid h-11 w-11 place-items-center rounded-md ${color as string} text-white`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-2 text-center text-xs font-bold">{label as string}</p>
                  </div>
                </div>
              ))}

              <div className="absolute left-[18%] top-[26%] h-px w-32 rotate-[28deg] bg-white/16" />
              <div className="absolute right-[18%] top-[30%] h-px w-32 rotate-[-30deg] bg-white/16" />
              <div className="absolute bottom-[27%] left-[21%] h-px w-32 rotate-[-28deg] bg-white/16" />
              <div className="absolute bottom-[27%] right-[21%] h-px w-32 rotate-[28deg] bg-white/16" />
            </div>
          </div>
        </div>
      </section>

      <section id="paths" className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-white">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold">Live Paths</h2>
            <p className="mt-1 text-ink/60">Pick a scenario, follow the steps, then open the working experience.</p>
          </div>
        </div>
        <div className="grid gap-4">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <Link key={path.title} href={path.href} className={`group relative block overflow-hidden rounded-md border border-ink/10 p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-ink/20 ${path.surface}`}>
                <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${path.rail}`} />
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-ink/10 bg-white/45" />
                <div className="pointer-events-none absolute -right-3 top-16 h-20 w-20 rotate-12 rounded-md border border-ink/10 bg-white/30" />
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-11 w-11 place-items-center rounded-md ${path.accent}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold">{path.title}</h3>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">{path.body}</p>
                    </div>
                  </div>
                  <span className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white transition group-hover:bg-reef">
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="relative z-10 mt-5 grid gap-3 md:grid-cols-3">
                  {path.steps.map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-paper text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="flex min-h-11 flex-1 items-center justify-between rounded-md border border-ink/10 px-3 text-sm font-semibold text-ink/72">
                        {step}
                        <CheckCircle2 className="h-4 w-4 text-reef" />
                      </span>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
