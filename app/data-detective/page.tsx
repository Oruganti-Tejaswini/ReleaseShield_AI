"use client";

import Link from "next/link";
import Papa from "papaparse";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { ArrowLeft, BarChart3, DatabaseZap, FileSpreadsheet, FlaskConical, Info, Lightbulb, RotateCcw, Sparkles, Upload, X } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ScoreCard } from "@/components/ScoreCard";
import { analyzeDataset, sampleDetectiveRows, type CsvRow, type DataDetectiveResult } from "@/lib/dataDetective";

const tabs = ["Overview", "Data Quality", "Trends & Charts", "AI Insights", "Cleaning Suggestions"] as const;
type Tab = (typeof tabs)[number];

const tabInfo: Record<Tab, string> = {
  Overview:
    "Overview counts rows/columns, lists detected headers, and shows the quality score created by the rule engine.",
  "Data Quality":
    "Quality checks count missing values, exact duplicate rows, duplicate ID-like columns, invalid numeric/category values, data type issues, and IQR outliers.",
  "Trends & Charts":
    "Charts are generated when expected business columns exist, such as revenue by product or region, renewal status counts, support tickets, and NPS by segment.",
  "AI Insights":
    "Insights are rule-backed summaries using score, missing values, duplicates, invalid values, outliers, and chart leaders as evidence.",
  "Cleaning Suggestions":
    "Cleaning suggestions are prioritized from detected issues: missing values, duplicate IDs, invalid business rules, and outlier columns."
};

function normalizeRows(rows: Record<string, unknown>[]) {
  return rows
    .map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key.trim(), value === undefined || value === null ? "" : value])
      ) as CsvRow
    )
    .filter((row) => Object.values(row).some((value) => String(value ?? "").trim() !== ""));
}

export default function DataDetectivePage() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [result, setResult] = useState<DataDetectiveResult | null>(null);
  const [active, setActive] = useState<Tab>("Overview");
  const [fileName, setFileName] = useState("");
  const [showFlow, setShowFlow] = useState(false);
  const previewRows = useMemo(() => rows.slice(0, 12), [rows]);

  function runAnalysis(nextRows: CsvRow[], nextFileName = "Sample dataset") {
    setRows(nextRows);
    setResult(analyzeDataset(nextRows));
    setFileName(nextFileName);
    setActive("Overview");
    localStorage.setItem("dataDetective:lastRows", JSON.stringify(nextRows));
  }

  function resetDataDetective() {
    setRows([]);
    setResult(null);
    setFileName("");
    setActive("Overview");
    localStorage.removeItem("dataDetective:lastRows");
  }

  async function handleFile(file?: File) {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "csv") {
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (parsed) => runAnalysis(normalizeRows(parsed.data), file.name)
      });
      return;
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    runAnalysis(normalizeRows(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)), file.name);
  }

  const cards = result
    ? [
        {
          label: "Rows Analyzed",
          value: String(result.dataset_summary.row_count),
          hint: "Counts usable records after parsing the uploaded file and removing fully blank rows.",
          icon: DatabaseZap
        },
        {
          label: "Columns Detected",
          value: String(result.dataset_summary.column_count),
          hint: "Counts unique headers detected from the dataset schema.",
          icon: FileSpreadsheet
        },
        {
          label: "Quality Score",
          value: `${result.dataset_summary.data_quality_score}/100`,
          hint: "Scores trustworthiness using missing data, duplicates, invalid business rules, type issues, and outliers.",
          icon: BarChart3
        },
        {
          label: "Missing Values",
          value: String(result.data_quality.missing_values.reduce((sum, item) => sum + item.missing_count, 0)),
          hint: "Counts blank or empty cells across all detected columns.",
          icon: Info
        },
        {
          label: "Duplicate Rows",
          value: String(result.data_quality.duplicate_rows),
          hint: "Counts exact duplicate records after converting each row into a comparable structure.",
          icon: FileSpreadsheet
        },
        {
          label: "Outliers",
          value: String(result.data_quality.outliers.reduce((sum, item) => sum + item.count, 0)),
          hint: "Detects unusually high or low numeric values using the spread of each numeric column.",
          icon: BarChart3
        }
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#f3f5f9] text-ink">
      <header className="border-b border-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-violet text-white">
              <DatabaseZap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase text-ink/50">Data Detective Agent</p>
              <h1 className="text-xl font-bold">CSV Crawler & Insights</h1>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFlow(true)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-paper px-3 text-sm font-bold text-ink/70 transition hover:border-violet hover:text-violet"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Data Detective Flow
            </button>
            <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-paper px-3 text-sm font-bold text-ink/70 transition hover:border-violet hover:text-violet">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>
      </header>

      {showFlow ? (
        <div className="fixed inset-0 z-50 bg-ink/50 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-8 max-w-xl rounded-md bg-paper p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <FileSpreadsheet className="h-5 w-5 text-violet" />
                Data Detective Flow
              </h2>
              <button
                type="button"
                onClick={() => setShowFlow(false)}
                className="grid h-9 w-9 place-items-center rounded-md border border-ink/10 bg-white text-ink/70 transition hover:text-ink"
                title="Close data detective flow"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
              {[
                ["Input Agent", "Reads uploaded CSV/Excel and converts it into structured rows."],
                ["Schema Detection Agent", "Detects columns, data types, and possible business meaning."],
                ["Data Quality Agent", "Finds missing values, duplicates, invalid values, and inconsistent categories."],
                ["Outlier Detection Agent", "Finds extreme revenue, cost, ticket, or score values."],
                ["Chart Agent", "Chooses useful visualizations and prepares chart-ready data."],
                ["Executive Summary Agent", "Creates plain-English insights and next actions."]
              ].map(([title, detail], index) => (
                <div key={title} className="mt-3 flex items-start gap-3 first:mt-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-violet/10 text-sm font-bold text-violet">{index + 1}</span>
                  <div className="rounded-md border border-ink/10 bg-paper p-3">
                    <p className="font-bold">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-ink/60">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-[1600px] gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[400px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="relative overflow-hidden rounded-md border border-ink/10 bg-white p-5 shadow-soft">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet/10" />
            <div className="pointer-events-none absolute -right-4 top-28 h-20 w-20 rotate-12 rounded-md border border-violet/10 bg-violet/5" />
            <span className="inline-flex items-center gap-2 rounded-md bg-violet/10 px-3 py-2 text-sm font-bold text-violet">
              <Sparkles className="h-4 w-4" />
              From noise to insight
            </span>
            <h2 className="mt-4 text-3xl font-bold">Upload messy data. Get an analyst-grade readout.</h2>
            <p className="mt-3 leading-7 text-ink/60">
              Profile CSV or Excel files, detect data quality issues, generate charts, and receive business-ready next actions.
            </p>

            <div className="relative z-10 mt-5 grid gap-3">
              <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-ink px-4 font-bold text-white transition hover:bg-violet">
                <Upload className="h-4 w-4" />
                Upload CSV/XLSX
                <input type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} />
              </label>
              <button
                type="button"
                onClick={() => runAnalysis(sampleDetectiveRows)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-violet/20 bg-violet/10 px-4 font-bold text-violet transition hover:bg-violet hover:text-white"
              >
                <FlaskConical className="h-4 w-4" />
                Try Sample Data
              </button>
              <button
                type="button"
                onClick={resetDataDetective}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-ink/10 bg-paper px-4 font-bold text-ink/65 transition hover:border-violet hover:text-violet"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
            {fileName ? <p className="mt-4 text-sm font-semibold text-ink/55">Loaded: {fileName}</p> : null}
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          {!result ? (
            <section className="grid min-h-[560px] place-items-center rounded-md border border-dashed border-ink/20 bg-white p-8 text-center shadow-sm">
              <div className="max-w-md">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-violet/10 text-violet">
                  <BarChart3 className="h-7 w-7" />
                </span>
                <h2 className="mt-5 text-2xl font-bold">Upload a dataset</h2>
                <p className="mt-3 leading-7 text-ink/60">Preview rows, quality score, data issues, charts, insights, and cleaning suggestions will appear here.</p>
              </div>
            </section>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                  <ScoreCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    hint={card.hint}
                    icon={card.icon}
                    accent="violet"
                  />
                ))}
              </div>

              <section className="rounded-md border border-ink/10 bg-white p-2 shadow-soft">
                <div className="grid gap-2 border-b border-ink/10 p-2 md:grid-cols-5">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActive(tab)}
                      className={`min-h-11 rounded-md px-3 text-sm font-bold transition ${active === tab ? "bg-violet text-white" : "bg-[#f3f5f9] text-ink/65 hover:bg-violet/10 hover:text-violet"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  <div className="mb-4 flex items-start gap-2 rounded-md border border-ink/10 bg-paper p-3 text-sm leading-6 text-ink/65">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet" />
                    <p>{tabInfo[active]}</p>
                  </div>
                  {active === "Overview" ? (
                    <div className="space-y-5">
                      <div className="rounded-md bg-paper p-4">
                        <h3 className="font-bold">Executive Summary</h3>
                        <p className="mt-2 leading-7 text-ink/65">{result.executive_summary}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {result.dataset_summary.detected_columns.map((column) => (
                            <span key={column} className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-ink/65">{column}</span>
                          ))}
                        </div>
                      </div>
                      <DataPreview rows={previewRows} />
                    </div>
                  ) : null}

                  {active === "Data Quality" ? <DataQuality result={result} /> : null}
                  {active === "Trends & Charts" ? <Charts result={result} /> : null}
                  {active === "AI Insights" ? <Insights result={result} /> : null}
                  {active === "Cleaning Suggestions" ? <Cleaning result={result} /> : null}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function DataPreview({ rows }: { rows: CsvRow[] }) {
  const columns = Object.keys(rows[0] ?? {});
  return (
    <div className="overflow-hidden rounded-md border border-ink/10 bg-white">
      <div className="border-b border-ink/10 p-3 font-bold">Data Preview</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink/[0.03] text-xs uppercase text-ink/50">
            <tr>{columns.map((column) => <th key={column} className="px-3 py-2">{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-ink/10">
                {columns.map((column) => <td key={column} className="px-3 py-2 text-ink/65">{String(row[column] ?? "")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataQuality({ result }: { result: DataDetectiveResult }) {
  const groups = [
    ["Missing Values", result.data_quality.missing_values.map((item) => `${item.column}: ${item.missing_count} missing (${item.missing_percentage}%)`)],
    ["Duplicate IDs", result.data_quality.duplicate_ids.map((item) => `${item.column}: ${item.duplicate_count} duplicates`)],
    ["Invalid Values", result.data_quality.invalid_values.map((item) => `${item.column}: ${item.issue} (${item.count})`)],
    ["Outliers", result.data_quality.outliers.map((item) => `${item.column}: ${item.count} outliers`)],
    ["Data Type Issues", result.data_quality.data_type_issues.map((item) => `${item.column}: ${item.issue} (${item.count})`)]
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map(([title, items]) => (
        <div key={title as string} className="rounded-md border border-ink/10 bg-paper p-4">
          <h3 className="font-bold">{title as string}</h3>
          {(items as string[]).length ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/65">{(items as string[]).map((item) => <li key={item}>{item}</li>)}</ul>
          ) : (
            <p className="mt-3 text-sm text-ink/50">No issues detected.</p>
          )}
        </div>
      ))}
    </div>
  );
}

function Charts({ result }: { result: DataDetectiveResult }) {
  const [chartMode, setChartMode] = useState<"bar" | "line" | "area" | "pie">("bar");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink/10 bg-paper p-3">
        <div>
          <h3 className="font-bold">Visualization Mode</h3>
          <p className="mt-1 text-sm text-ink/55">Switch between multiple chart views for the same dataset.</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(["bar", "line", "area", "pie"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setChartMode(mode)}
              className={`h-9 rounded-md px-3 text-sm font-bold capitalize transition ${
                chartMode === mode ? "bg-violet text-white" : "bg-white text-ink/65 hover:text-violet"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {result.charts.map((chart) => (
          <div key={chart.title} className="rounded-md border border-ink/10 bg-paper p-4">
            <h3 className="font-bold">{chart.title}</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === "pie" ? (
                  <PieChart>
                    <Tooltip />
                    <Pie data={chart.data} dataKey="value" nameKey="name" outerRadius={96}>
                      {chart.data.map((_, index) => <Cell key={index} fill={["#6c5ce7", "#009f9d", "#f0b429", "#ef4444", "#22c55e"][index % 5]} />)}
                    </Pie>
                  </PieChart>
                ) : chartMode === "line" ? (
                  <LineChart data={chart.data} margin={{ top: 8, right: 8, bottom: 24, left: -18 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#6c5ce7" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                ) : chartMode === "area" ? (
                  <AreaChart data={chart.data} margin={{ top: 8, right: 8, bottom: 24, left: -18 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#6c5ce7" fill="#6c5ce7" fillOpacity={0.28} />
                  </AreaChart>
                ) : (
                  <BarChart data={chart.data} margin={{ top: 8, right: 8, bottom: 24, left: -18 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Insights({ result }: { result: DataDetectiveResult }) {
  return (
    <div className="grid gap-4">
      {result.business_insights.map((insight) => (
        <div key={insight.title} className="rounded-md border border-ink/10 bg-paper p-4">
          <h3 className="flex items-center gap-2 font-bold"><Lightbulb className="h-4 w-4 text-signal" />{insight.title}</h3>
          <p className="mt-2 leading-7 text-ink/65">{insight.insight}</p>
          <p className="mt-2 text-sm font-semibold text-ink/50">Evidence: {insight.evidence}</p>
        </div>
      ))}
      <div className="rounded-md border border-ink/10 bg-white p-4">
        <h3 className="font-bold">Recommended Actions</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/65">
          {result.recommended_actions.map((action) => <li key={action.action}>{action.action} — {action.reason}</li>)}
        </ul>
      </div>
    </div>
  );
}

function Cleaning({ result }: { result: DataDetectiveResult }) {
  return (
    <div className="overflow-hidden rounded-md border border-ink/10 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-ink/[0.03] text-xs uppercase text-ink/50">
          <tr><th className="px-3 py-3">Issue</th><th className="px-3 py-3">Column</th><th className="px-3 py-3">Severity</th><th className="px-3 py-3">Suggested Fix</th></tr>
        </thead>
        <tbody>
          {result.cleaning_plan.map((item, index) => (
            <tr key={`${item.issue}-${index}`} className="border-t border-ink/10">
              <td className="px-3 py-3 font-semibold">{item.issue}</td>
              <td className="px-3 py-3 text-ink/65">{item.affected_column}</td>
              <td className="px-3 py-3 text-ink/65">{item.severity}</td>
              <td className="px-3 py-3 text-ink/65">{item.suggested_fix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
