"use client";

import { useState } from "react";
import { AlertTriangle, Gauge, Mail, ShieldCheck, Wrench } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalysisResult } from "@/lib/types";
import { FixCenter } from "@/components/FixCenter";
import { ManagerUpdate } from "@/components/ManagerUpdate";
import { ScoreCard } from "@/components/ScoreCard";
import { SecurityFindingsTable } from "@/components/SecurityFindingsTable";

const tabs = [
  { id: "safety", label: "Release Safety", icon: Gauge },
  { id: "security", label: "AgentShield Security", icon: ShieldCheck },
  { id: "fix", label: "Fix Center", icon: Wrench },
  { id: "manager", label: "Manager Update", icon: Mail }
] as const;

type TabId = (typeof tabs)[number]["id"];

export function DashboardTabs({ result, initialTab = "safety" }: { result: AnalysisResult; initialTab?: TabId }) {
  const [active, setActive] = useState<TabId>(initialTab);
  const chartData = [
    { name: "Readiness", score: result.release_readiness_score },
    { name: "Safety", score: Math.max(0, 100 - result.security_findings.length * 16) },
    { name: "Tests", score: result.test_readiness.status === "Passed" ? 92 : result.test_readiness.status === "Partial" ? 58 : 34 }
  ];

  return (
    <section className="rounded-md border border-ink/10 bg-white p-2 shadow-soft">
      <div className="grid gap-2 border-b border-ink/10 p-2 md:grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition ${
                selected ? "bg-reef text-white shadow-sm" : "bg-[#f3f5f9] text-ink/65 hover:bg-reef/10 hover:text-reef"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {active === "safety" ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              <ScoreCard
                label="Work Status"
                value={result.work_status}
                icon={Gauge}
                accent="reef"
                hint="Shows whether the submitted work appears complete, partial, or blocked based on security, testing, approval, and code-health signals."
              />
              <ScoreCard
                label="Release Decision"
                value={result.release_decision}
                icon={AlertTriangle}
                accent={result.release_decision === "No-Go" ? "red" : result.release_decision === "Go" ? "reef" : "signal"}
                hint="Combines code safety, leakage findings, test readiness, approval signals, and blockers into a release recommendation."
              />
              <ScoreCard
                label="Readiness Score"
                value={`${result.release_readiness_score}/100`}
                icon={Gauge}
                accent="violet"
                hint="Scores release readiness by weighing security findings, code health, test status, approval status, and unresolved blockers."
              />
              <ScoreCard
                label="Security Leakage"
                value={result.security_leakage_score}
                icon={ShieldCheck}
                accent={result.security_leakage_score === "Critical" ? "red" : "signal"}
                hint="Reflects the highest detected leak severity from secrets, tokens, internal URLs, unsafe logs, and sensitive data patterns."
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="rounded-md border border-ink/10 bg-paper p-4">
                <h3 className="font-bold">PR Summary</h3>
                <p className="mt-2 leading-7 text-ink/65">{result.pr_summary}</p>
                <h3 className="mt-5 font-bold">Main Risks</h3>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-ink/65">
                  {result.main_risks.map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
                <h3 className="mt-5 font-bold">Next Steps</h3>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-ink/65">
                  {result.next_steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-ink/10 bg-paper p-4">
                <h3 className="font-bold">Readiness Signals</h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 4, bottom: 8, left: -24 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#009f9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {active === "security" ? <SecurityFindingsTable findings={result.security_findings} /> : null}
        {active === "fix" ? <FixCenter fix={result.fix_center} /> : null}
        {active === "manager" ? (
          <ManagerUpdate
            update={result.manager_update}
            outlook={result.outlook_mail_tracking}
            codeLooksGood={
              !result.security_findings.some((finding) => ["Medium", "High", "Critical"].includes(finding.severity)) &&
              result.release_decision !== "No-Go"
            }
          />
        ) : null}
      </div>
    </section>
  );
}
