"use client";

import { FlaskConical, GitPullRequest, Loader2, Play, RotateCcw } from "lucide-react";
import type { AnalyzeFormInput } from "@/lib/types";

const fieldClass =
  "w-full rounded-md border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-reef focus:ring-4 focus:ring-reef/10";

export function AnalysisForm({
  form,
  loading,
  error,
  onChange,
  onSubmit,
  onSample,
  onReset
}: {
  form: AnalyzeFormInput;
  loading: boolean;
  error: string;
  onChange: (field: keyof AnalyzeFormInput, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSample: () => void;
  onReset: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="relative overflow-hidden rounded-md border border-ink/10 bg-white p-4 shadow-soft">
      <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-reef/10" />
      <div className="relative z-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Input Details</h2>
          <p className="mt-1 text-sm text-ink/55">Paste release evidence and run the safety agents.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-paper px-3 text-sm font-bold text-ink/65 transition hover:border-reef hover:text-reef"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={onSample}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-reef/25 bg-reef/10 px-3 text-sm font-bold text-reef transition hover:bg-reef hover:text-white"
          >
            <FlaskConical className="h-4 w-4" />
            Sample data
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">PR Title</span>
          <input className={fieldClass} value={form.prTitle} onChange={(event) => onChange("prTitle", event.target.value)} placeholder="Add payment retry logic" />
        </label>
        <label className="grid gap-1.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <GitPullRequest className="h-4 w-4 text-reef" />
            GitHub PR Link
          </span>
          <input
            className={fieldClass}
            value={form.prUrl}
            onChange={(event) => onChange("prUrl", event.target.value)}
            placeholder="https://github.com/org/repo/pull/123"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">PR Description / What Changed</span>
          <textarea className={fieldClass} rows={3} value={form.prDescription} onChange={(event) => onChange("prDescription", event.target.value)} placeholder="Summarize what changed. If a GitHub PR link is provided, the app can read the PR title/body automatically." />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">Changed Code / Diff</span>
          <textarea className={`${fieldClass} font-mono`} rows={8} value={form.codeDiff} onChange={(event) => onChange("codeDiff", event.target.value)} placeholder="Paste changed code or diff. Leave empty when using a readable GitHub PR link." />
        </label>
      </div>

      {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

      <div className="mt-5">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-ink px-5 font-bold text-white transition hover:bg-reef disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {loading ? "Analyzing" : "Audit PR Analysis"}
        </button>
      </div>
      </div>
    </form>
  );
}
