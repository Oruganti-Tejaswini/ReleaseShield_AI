import { Bot, CheckCircle2 } from "lucide-react";

const flows = {
  audit: [
    ["PR Intake", "User provides GitHub PR link, PR title, PR summary, or changed code/diff."],
    ["Change Understanding", "Reads what changed and identifies affected files, behavior, feature scope, and release intent."],
    ["Code Review Scan", "Analyzes the provided changed code for security leakage, risky patterns, broken logic, missing validation, and unsafe logs."],
    ["Deployment Risk Check", "Decides whether the PR looks good to deploy, needs caution, or is too risky to release."],
    ["Risk Factor Breakdown", "Explains what caused the risk, such as secrets, missing tests, approval blockers, runtime errors, or unclear impact."],
    ["Release Decision", "Returns Go, Go with Caution, or No-Go with evidence from the submitted PR details and code."],
    ["Manager Update Draft", "Creates a manager-ready email or chat message based on the PR audit result when the user chooses to draft it."]
  ],
  fix: [
    ["Input Agent", "Reads selected language, pasted or uploaded code, optional logs, and optional comments."],
    ["Language Parser Agent", "Uses the selected language to validate syntax for Python, Java, HTML, JS, TS, JSON, or other code."],
    ["Log & Comment Agent", "Reads uploaded log files and comments to identify runtime errors, expected behavior, and blockers."],
    ["Code Health Agent", "Checks whether the code appears to compile or parse and flags unsafe or broken patterns."],
    ["Fix Recommendation Agent", "Suggests safe reviewable code fixes when the code is not working."],
    ["Verifier Agent", "Ensures claims and fixes are tied to code, logs, comments, or submitted evidence."]
  ]
};

export function AgentFlow({ mode = "audit" }: { mode?: "audit" | "fix" }) {
  const agents = flows[mode];

  return (
    <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Bot className="h-5 w-5 text-reef" />
        <h2 className="text-lg font-bold">{mode === "audit" ? "Audit PR Flow" : "Fix Coding Flow"}</h2>
      </div>
      <div className="grid gap-2">
        {agents.map(([agent, detail], index) => (
          <div key={agent} className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-reef/10 text-sm font-bold text-reef">
              {index + 1}
            </span>
            <div className="flex min-h-10 flex-1 items-start justify-between gap-3 rounded-md border border-ink/10 px-3 py-2">
              <div>
                <p className="text-sm font-bold">{agent}</p>
                <p className="mt-1 text-xs leading-5 text-ink/55">{detail}</p>
              </div>
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
