import { CheckCircle2, Code2, TestTube2, XCircle } from "lucide-react";
import type { FixCenter as FixCenterType } from "@/lib/types";
import { CopyButton } from "@/components/CopyButton";

export function FixCenter({ fix }: { fix: FixCenterType }) {
  const valid = fix.syntax_valid;
  const goodToGo =
    valid &&
    fix.validation_status === "Valid" &&
    /no obvious blocking issue|appears fine|code alone/i.test(`${fix.root_cause} ${fix.error_explanation}`);

  return (
    <div className="space-y-4">
      <div className={`rounded-md border p-4 ${valid ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              {valid ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              Syntax Validation: {fix.validation_status || "Needs Review"}
            </h3>
            <p className="mt-1 text-sm font-semibold">Detected language: {fix.detected_language || "Unknown"}</p>
          </div>
          <span className={`rounded-md px-3 py-1 text-sm font-bold ${valid ? "bg-emerald-100" : "bg-red-100"}`}>
            {valid ? "Compile-ready scan passed" : "Syntax issue found"}
          </span>
        </div>
        {fix.validation_details?.length ? (
          <ul className="mt-3 space-y-1 text-sm leading-6">
            {fix.validation_details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {goodToGo ? (
        <div className="rounded-md border border-emerald-200 bg-white p-5 text-emerald-950">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <CheckCircle2 className="h-5 w-5" />
            Good to go with the code
          </h3>
          <p className="mt-2 leading-7 text-emerald-800">
            The submitted code passed syntax validation and no obvious blocking issue was detected from the provided input.
          </p>
        </div>
      ) : null}

      {!goodToGo ? (
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-md border border-ink/10 bg-white p-4">
            <h3 className="font-bold">Root Cause</h3>
            <p className="mt-2 leading-7 text-ink/65">{fix.root_cause}</p>
          </div>
          <div className="rounded-md border border-ink/10 bg-white p-4">
            <h3 className="font-bold">Step-by-Step Fix</h3>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-ink/65">
              {fix.fix_steps.map((step, index) => (
                <li key={step}>{index + 1}. {step}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-md border border-ink/10 bg-white p-4">
            <h3 className="flex items-center gap-2 font-bold">
              <TestTube2 className="h-4 w-4 text-reef" />
              Test Suggestions
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/65">
              {fix.test_suggestions.map((test) => (
                <li key={test}>{test}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-md border border-ink/10 bg-ink p-4 text-white">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-bold">
              <Code2 className="h-4 w-4 text-reef" />
              Reviewable Fixed Code
            </h3>
            <CopyButton value={fix.fixed_code} label="Copy code" />
          </div>
          <pre className="max-h-[540px] overflow-auto rounded-md bg-black/35 p-4 text-sm leading-6 text-white/85">
            <code>{fix.fixed_code || "No fixed code is available for this input."}</code>
          </pre>
        </div>
      </div>
      ) : null}
    </div>
  );
}
