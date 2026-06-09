"use client";

import { Code2, FileText, FlaskConical, Loader2, MessageSquareText, Play, RotateCcw, Upload } from "lucide-react";
import type { AnalyzeFormInput } from "@/lib/types";

const fieldClass =
  "w-full rounded-md border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-reef focus:ring-4 focus:ring-reef/10";

const languages = [
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "html", label: "HTML" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "json", label: "JSON" },
  { value: "other", label: "Other" }
];

export function FixIssueForm({
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
  async function readFile(field: keyof AnalyzeFormInput, file?: File) {
    if (!file) return;
    onChange(field, await file.text());
  }

  return (
    <form onSubmit={onSubmit} className="relative overflow-hidden rounded-md border border-ink/10 bg-white p-4 shadow-soft">
      <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-signal/20" />
      <div className="pointer-events-none absolute -left-10 bottom-20 h-24 w-24 rotate-12 rounded-md border border-reef/10 bg-reef/5" />
      <div className="relative z-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Fix Coding Issues</h2>
          <p className="mt-1 text-sm text-ink/55">Scan code with optional logs and comments, then generate a reviewable fix.</p>
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

      <div className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">Coding Language</span>
          <select
            className={fieldClass}
            value={form.codeLanguage || "javascript"}
            onChange={(event) => onChange("codeLanguage", event.target.value)}
          >
            {languages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Code2 className="h-4 w-4 text-reef" />
            Code or Source File <span className="text-red-600">*</span>
          </span>
          <textarea
            className={`${fieldClass} min-h-[260px] font-mono`}
            value={form.codeDiff}
            onChange={(event) => onChange("codeDiff", event.target.value)}
            placeholder="Paste the code that is failing or needs review. This field is mandatory."
          />
          <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-ink/10 bg-paper px-4 text-sm font-bold text-ink/70 transition hover:border-reef hover:text-reef">
            <Upload className="h-4 w-4" />
            Upload code file
            <input
              type="file"
              accept=".py,.java,.html,.htm,.js,.jsx,.ts,.tsx,.json,.txt"
              className="sr-only"
              onChange={(event) => readFile("codeDiff", event.target.files?.[0])}
            />
          </label>
        </label>

        <label className="grid gap-1.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-violet" />
            Log File or Error Logs
          </span>
          <textarea
            className={`${fieldClass} min-h-[150px] font-mono`}
            value={form.errorLogs}
            onChange={(event) => onChange("errorLogs", event.target.value)}
            placeholder="Paste logs if available. Leave empty to scan code only."
          />
          <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-ink/10 bg-paper px-4 text-sm font-bold text-ink/70 transition hover:border-reef hover:text-reef">
            <Upload className="h-4 w-4" />
            Upload log file
            <input
              type="file"
              accept=".log,.txt,.md,.json"
              className="sr-only"
              onChange={(event) => readFile("errorLogs", event.target.files?.[0])}
            />
          </label>
        </label>

        <label className="grid gap-1.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquareText className="h-4 w-4 text-signal" />
            Comments
          </span>
          <textarea
            className={fieldClass}
            rows={4}
            value={form.communicationNotes}
            onChange={(event) => onChange("communicationNotes", event.target.value)}
            placeholder="Expected behavior, actual behavior, edge cases, or reviewer comments"
          />
        </label>
      </div>

      {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-ink px-5 font-bold text-white transition hover:bg-reef disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {loading ? "Scanning code" : "Scan Code"}
      </button>
      </div>
    </form>
  );
}
