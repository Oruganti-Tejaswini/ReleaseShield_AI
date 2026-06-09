import type { SecurityFinding } from "@/lib/types";

const severityClass = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-yellow-50 text-yellow-800",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-red-50 text-red-700"
};

export function SecurityFindingsTable({ findings }: { findings: SecurityFinding[] }) {
  if (!findings.length) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        No security leaks were detected in the submitted input.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-ink/10 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ink/10 text-left text-sm">
          <thead className="bg-ink/[0.03] text-xs uppercase text-ink/55">
            <tr>
              <th className="px-4 py-3 font-semibold">Finding</th>
              <th className="px-4 py-3 font-semibold">Severity</th>
              <th className="px-4 py-3 font-semibold">Evidence</th>
              <th className="px-4 py-3 font-semibold">Suggested Fix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {findings.map((finding, index) => (
              <tr key={`${finding.type}-${index}`}>
                <td className="max-w-[220px] px-4 py-3 font-semibold text-ink">{finding.type}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${severityClass[finding.severity]}`}>
                    {finding.severity}
                  </span>
                </td>
                <td className="max-w-[320px] px-4 py-3">
                  <code className="break-words rounded bg-ink/[0.04] px-2 py-1 text-xs text-ink/75">
                    {finding.evidence}
                  </code>
                </td>
                <td className="min-w-[260px] px-4 py-3 text-ink/65">{finding.suggested_fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
