"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Bot, ShieldCheck, Wrench, X } from "lucide-react";
import { AgentFlow } from "@/components/AgentFlow";
import { AnalysisForm } from "@/components/AnalysisForm";
import { DashboardTabs } from "@/components/DashboardTabs";
import { FixCenter } from "@/components/FixCenter";
import { FixIssueForm } from "@/components/FixIssueForm";
import { initialForm, sampleFixForm, sampleForm } from "@/lib/sampleData";
import type { AnalysisResult, AnalyzeFormInput } from "@/lib/types";

export default function AnalyzePage() {
  const [mode, setMode] = useState<"audit" | "fix">("audit");
  const [form, setForm] = useState<AnalyzeFormInput>(initialForm);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAgentFlow, setShowAgentFlow] = useState(false);

  useEffect(() => {
    const currentMode = new URLSearchParams(window.location.search).get("mode") === "fix" ? "fix" : "audit";
    setMode(currentMode);
    setForm(currentMode === "fix" ? { ...initialForm, mode: "fix", codeLanguage: "python" } : initialForm);
    setResult(null);
  }, []);

  function updateField(field: keyof AnalyzeFormInput, value: string) {
    setForm((previous) => {
      const next = { ...previous, mode, [field]: value };
      localStorage.setItem(`releaseShield:${mode}:lastForm`, JSON.stringify(next));
      return next;
    });
  }

  function loadSample() {
    const next = mode === "fix" ? sampleFixForm : sampleForm;
    setForm(next);
    setResult(null);
    setError("");
  }

  function resetAnalysis() {
    const next = mode === "fix" ? { ...initialForm, mode: "fix" as const, codeLanguage: "python" } : initialForm;
    setForm(next);
    setResult(null);
    setError("");
    localStorage.removeItem(`releaseShield:${mode}:lastForm`);
    localStorage.removeItem(`releaseShield:${mode}:lastAnalysis`);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedCode = form.codeDiff.trim();
    const trimmedPrUrl = form.prUrl.trim();

    if (mode === "fix" && !trimmedCode) {
      setError("Please fill the mandatory Code or Source File field before scanning.");
      return;
    }

    if (mode === "audit" && !trimmedPrUrl && !trimmedCode) {
      setError("Please add either a GitHub PR link or changed code before running Audit PR Analysis.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...form, mode })
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details ? `Analysis request failed (${response.status}): ${details.slice(0, 180)}` : `Analysis request failed (${response.status}).`
        );
      }

      const data = (await response.json()) as AnalysisResult;
      setResult(data);
      localStorage.setItem(`releaseShield:${mode}:lastAnalysis`, JSON.stringify(data));
      localStorage.setItem(`releaseShield:${mode}:lastForm`, JSON.stringify({ ...form, mode }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const isFixMode = mode === "fix";
  const flowLabel = isFixMode ? "Fix Coding Flow" : "Audit PR Flow";

  return (
    <main className="min-h-screen bg-[#f3f5f9] text-ink">
      <header className="border-b border-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-reef text-white">
              {isFixMode ? <Wrench className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </span>
            <div>
              <p className="text-sm font-semibold uppercase text-ink/50">ReleaseShield AI</p>
              <h1 className="text-xl font-bold">{isFixMode ? "Fix Coding Issues" : "Release Safety Analyzer"}</h1>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAgentFlow(true)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-paper px-3 text-sm font-bold text-ink/70 transition hover:border-reef hover:text-reef"
            >
              <Bot className="h-4 w-4" />
              {flowLabel}
            </button>
            <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-paper px-3 text-sm font-bold text-ink/70 transition hover:border-reef hover:text-reef">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>
      </header>

      {showAgentFlow ? (
        <div className="fixed inset-0 z-50 bg-ink/50 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-8 max-w-xl rounded-md bg-paper p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Bot className="h-5 w-5 text-reef" />
                {flowLabel}
              </h2>
              <button
                type="button"
                onClick={() => setShowAgentFlow(false)}
                className="grid h-9 w-9 place-items-center rounded-md border border-ink/10 bg-white text-ink/70 transition hover:text-ink"
                title="Close agent flow"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <AgentFlow mode={mode} />
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1600px] gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[460px_minmax(0,1fr)]">
        <div className="space-y-5">
          {isFixMode ? (
            <FixIssueForm
              form={form}
              loading={loading}
              error={error}
              onChange={updateField}
              onSubmit={handleSubmit}
              onSample={loadSample}
              onReset={resetAnalysis}
            />
          ) : (
            <AnalysisForm
              form={form}
              loading={loading}
              error={error}
              onChange={updateField}
              onSubmit={handleSubmit}
              onSample={loadSample}
              onReset={resetAnalysis}
            />
          )}
        </div>

        <div className="min-w-0">
          {result ? (
            isFixMode ? (
              <section className="relative overflow-hidden rounded-md border border-ink/10 bg-white p-4 shadow-soft">
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-reef/10" />
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase text-ink/50">Fix Center</p>
                  <h2 className="text-2xl font-bold">Code Validation and Suggested Fix</h2>
                  <p className="mt-2 leading-7 text-ink/60">{result.pr_summary}</p>
                </div>
                <FixCenter fix={result.fix_center} />
              </section>
            ) : (
              <DashboardTabs result={result} initialTab="safety" />
            )
          ) : (
            <section className="relative grid min-h-[560px] place-items-center overflow-hidden rounded-md border border-dashed border-ink/20 bg-white p-8 text-center shadow-sm">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-reef/10" />
              <div className="pointer-events-none absolute -left-12 bottom-10 h-36 w-36 rotate-12 rounded-md border border-violet/10 bg-violet/5" />
              <div className="max-w-md">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-reef/10 text-reef">
                  {isFixMode ? <Wrench className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
                </span>
                <h2 className="mt-5 text-2xl font-bold">{isFixMode ? "Scan code for fixes" : "Run an analysis"}</h2>
                <p className="mt-3 leading-7 text-ink/60">
                  {isFixMode
                    ? "Results will appear here with root cause, detailed explanation, fixed code, risk of fix, and test suggestions."
                    : "Results will appear here with release decision, security findings, test readiness, communication tracking, reviewable fixes, and manager updates."}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
