export type ImpactLevel = "Low" | "Medium" | "High";

export type CsvRow = Record<string, string | number | null>;

export interface DataDetectiveResult {
  dataset_summary: {
    row_count: number;
    column_count: number;
    detected_columns: string[];
    data_quality_score: number;
  };
  data_quality: {
    missing_values: { column: string; missing_count: number; missing_percentage: number }[];
    duplicate_rows: number;
    duplicate_ids: { column: string; duplicate_count: number; examples: string[] }[];
    invalid_values: { column: string; issue: string; count: number; examples: string[] }[];
    outliers: { column: string; count: number; examples: number[] }[];
    data_type_issues: { column: string; expected_type: string; issue: string; count: number }[];
  };
  business_insights: { title: string; insight: string; evidence: string; impact: ImpactLevel }[];
  recommended_actions: { action: string; priority: ImpactLevel; reason: string }[];
  charts: { title: string; type: "bar" | "line" | "pie"; x_key: string; y_key: string; data: Record<string, string | number>[] }[];
  cleaning_plan: { issue: string; suggested_fix: string; affected_column: string; severity: ImpactLevel }[];
  executive_summary: string;
}

const blank = (value: unknown) => value === null || value === undefined || String(value).trim() === "";
const numberValue = (value: unknown) => {
  const parsed = Number(String(value ?? "").replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function aggregate(rows: CsvRow[], groupKey: string, valueKey: string) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const group = String(row[groupKey] ?? "Unknown").trim() || "Unknown";
    const value = numberValue(row[valueKey]) ?? 0;
    totals.set(group, (totals.get(group) ?? 0) + value);
  }
  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);
}

function countBy(rows: CsvRow[], key: string) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const group = String(row[key] ?? "Unknown").trim() || "Unknown";
    totals.set(group, (totals.get(group) ?? 0) + 1);
  }
  return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
}

function percentile(values: number[], p: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export function analyzeDataset(rows: CsvRow[]): DataDetectiveResult {
  const columns = unique(rows.flatMap((row) => Object.keys(row)));
  const rowStrings = rows.map((row) => JSON.stringify(row));
  const duplicateRows = rowStrings.length - unique(rowStrings).length;
  const missingValues = columns
    .map((column) => {
      const missing = rows.filter((row) => blank(row[column])).length;
      return {
        column,
        missing_count: missing,
        missing_percentage: rows.length ? Math.round((missing / rows.length) * 1000) / 10 : 0
      };
    })
    .filter((issue) => issue.missing_count > 0);

  const numericColumns = columns.filter((column) => rows.some((row) => numberValue(row[column]) !== null));
  const invalidValues: DataDetectiveResult["data_quality"]["invalid_values"] = [];
  const dataTypeIssues: DataDetectiveResult["data_quality"]["data_type_issues"] = [];
  const outliers: DataDetectiveResult["data_quality"]["outliers"] = [];
  const duplicateIds: DataDetectiveResult["data_quality"]["duplicate_ids"] = [];

  for (const column of columns) {
    const lower = column.toLowerCase();
    const values = rows.map((row) => row[column]).filter((value) => !blank(value));
    if (lower.includes("id")) {
      const seen = new Set<string>();
      const duplicates = new Set<string>();
      values.forEach((value) => {
        const current = String(value);
        if (seen.has(current)) duplicates.add(current);
        seen.add(current);
      });
      if (duplicates.size) {
        duplicateIds.push({ column, duplicate_count: duplicates.size, examples: Array.from(duplicates).slice(0, 5) });
      }
    }
    if (numericColumns.includes(column)) {
      const invalid = values.filter((value) => numberValue(value) === null);
      if (invalid.length) {
        dataTypeIssues.push({ column, expected_type: "number", issue: "Contains non-numeric values", count: invalid.length });
      }
      const numbers = values.map(numberValue).filter((value): value is number => value !== null);
      const negatives = numbers.filter((value) => value < 0);
      if (negatives.length && /(revenue|cost|seat|ticket|amount|price|nps|score)/i.test(column)) {
        invalidValues.push({
          column,
          issue: "Negative values detected where positive values are expected",
          count: negatives.length,
          examples: negatives.slice(0, 5).map(String)
        });
      }
      const q1 = percentile(numbers, 0.25);
      const q3 = percentile(numbers, 0.75);
      const iqr = q3 - q1;
      const extreme = numbers.filter((value) => iqr > 0 && (value < q1 - 1.5 * iqr || value > q3 + 1.5 * iqr));
      if (extreme.length) {
        outliers.push({ column, count: extreme.length, examples: extreme.slice(0, 5) });
      }
    }
  }

  const npsColumn = columns.find((column) => /nps/i.test(column));
  if (npsColumn) {
    const invalid = rows
      .map((row) => numberValue(row[npsColumn]))
      .filter((value): value is number => value !== null && (value < 0 || value > 10));
    if (invalid.length) {
      invalidValues.push({
        column: npsColumn,
        issue: "NPS values should be between 0 and 10",
        count: invalid.length,
        examples: invalid.slice(0, 5).map(String)
      });
    }
  }

  const revenueColumn = columns.find((column) => /revenue/i.test(column));
  const costColumn = columns.find((column) => /cost/i.test(column));
  if (revenueColumn && costColumn) {
    const badRows = rows.filter((row) => {
      const revenue = numberValue(row[revenueColumn]);
      const cost = numberValue(row[costColumn]);
      return revenue !== null && cost !== null && cost > revenue;
    });
    if (badRows.length) {
      invalidValues.push({
        column: `${costColumn} / ${revenueColumn}`,
        issue: "Cost is greater than revenue",
        count: badRows.length,
        examples: badRows.slice(0, 5).map((row) => `${row[costColumn]} > ${row[revenueColumn]}`)
      });
    }
  }

  let score = 100;
  score -= missingValues.length * 2;
  if (duplicateRows) score -= 5;
  if (duplicateIds.length) score -= 5;
  if (invalidValues.length) score -= invalidValues.length * 5;
  score -= outliers.length * 3;
  score = Math.max(0, Math.min(100, score));

  const charts: DataDetectiveResult["charts"] = [];
  const productColumn = columns.find((column) => /product/i.test(column));
  const regionColumn = columns.find((column) => /region/i.test(column));
  const renewalColumn = columns.find((column) => /renewal|status/i.test(column));
  const ticketsColumn = columns.find((column) => /ticket/i.test(column));
  const segmentColumn = columns.find((column) => /segment/i.test(column));

  if (productColumn && revenueColumn) charts.push({ title: "Revenue by Product Family", type: "bar", x_key: productColumn, y_key: revenueColumn, data: aggregate(rows, productColumn, revenueColumn) });
  if (regionColumn && revenueColumn) charts.push({ title: "Revenue by Region", type: "bar", x_key: regionColumn, y_key: revenueColumn, data: aggregate(rows, regionColumn, revenueColumn) });
  if (renewalColumn) charts.push({ title: "Renewal Status Distribution", type: "pie", x_key: renewalColumn, y_key: "count", data: countBy(rows, renewalColumn) });
  if (productColumn && ticketsColumn) charts.push({ title: "Support Tickets by Product Family", type: "bar", x_key: productColumn, y_key: ticketsColumn, data: aggregate(rows, productColumn, ticketsColumn) });
  if (segmentColumn && npsColumn) charts.push({ title: "NPS by Customer Segment", type: "bar", x_key: segmentColumn, y_key: npsColumn, data: aggregate(rows, segmentColumn, npsColumn) });

  const cleaningPlan = [
    ...missingValues.map((issue) => ({
      issue: "Missing values",
      affected_column: issue.column,
      suggested_fix: "Fill from source system, mark as unknown, or exclude from metric calculations.",
      severity: issue.missing_percentage > 10 ? "High" as ImpactLevel : "Medium" as ImpactLevel
    })),
    ...duplicateIds.map((issue) => ({
      issue: "Duplicate IDs",
      affected_column: issue.column,
      suggested_fix: "Keep the latest trusted record and remove duplicate ID rows.",
      severity: "High" as ImpactLevel
    })),
    ...invalidValues.map((issue) => ({
      issue: issue.issue,
      affected_column: issue.column,
      suggested_fix: "Validate against business rules and correct the source-system value.",
      severity: "High" as ImpactLevel
    })),
    ...outliers.map((issue) => ({
      issue: "Outliers detected",
      affected_column: issue.column,
      suggested_fix: "Review extreme values with business owners before removing or capping.",
      severity: "Medium" as ImpactLevel
    }))
  ].slice(0, 18);

  const insights = [
    {
      title: "Data trust level",
      insight: score >= 85 ? "The dataset is mostly clean and ready for analysis." : "The dataset needs cleanup before high-confidence decisions.",
      evidence: `Quality score is ${score}/100 with ${missingValues.length} missing-value columns and ${duplicateRows} duplicate rows.`,
      impact: score >= 85 ? "Medium" as ImpactLevel : "High" as ImpactLevel
    },
    revenueColumn && productColumn
      ? {
          title: "Revenue concentration",
          insight: "Revenue can be compared by product family to find top contributors and weak spots.",
          evidence: charts.find((chart) => chart.title === "Revenue by Product Family")?.data.slice(0, 3).map((item) => `${item.name}: ${item.value}`).join(", ") || "Revenue chart prepared.",
          impact: "Medium" as ImpactLevel
        }
      : null,
    invalidValues.length
      ? {
          title: "Business-rule exceptions",
          insight: "Some records violate expected business rules and should be reviewed before reporting.",
          evidence: invalidValues.map((issue) => `${issue.column}: ${issue.issue}`).slice(0, 3).join("; "),
          impact: "High" as ImpactLevel
        }
      : null
  ].filter((item): item is DataDetectiveResult["business_insights"][number] => Boolean(item));

  const recommendedActions = [
    ...missingValues.slice(0, 3).map((issue) => ({
      action: `Fix missing values in ${issue.column}`,
      priority: issue.missing_percentage > 10 ? "High" as ImpactLevel : "Medium" as ImpactLevel,
      reason: `${issue.missing_count} rows are missing this field.`
    })),
    ...duplicateIds.slice(0, 2).map((issue) => ({
      action: `Resolve duplicate IDs in ${issue.column}`,
      priority: "High" as ImpactLevel,
      reason: `${issue.duplicate_count} duplicate ID values were detected.`
    })),
    ...invalidValues.slice(0, 3).map((issue) => ({
      action: `Review ${issue.issue}`,
      priority: "High" as ImpactLevel,
      reason: `${issue.count} affected values in ${issue.column}.`
    }))
  ];

  return {
    dataset_summary: {
      row_count: rows.length,
      column_count: columns.length,
      detected_columns: columns,
      data_quality_score: score
    },
    data_quality: {
      missing_values: missingValues,
      duplicate_rows: duplicateRows,
      duplicate_ids: duplicateIds,
      invalid_values: invalidValues,
      outliers,
      data_type_issues: dataTypeIssues
    },
    business_insights: insights,
    recommended_actions: recommendedActions.length ? recommendedActions : [{ action: "Validate the dataset with the business owner", priority: "Low", reason: "No severe data quality issue was detected by rules." }],
    charts,
    cleaning_plan: cleaningPlan,
    executive_summary: `Analyzed ${rows.length} rows across ${columns.length} columns. Data quality score is ${score}/100. ${cleaningPlan.length ? "Cleanup is recommended before executive reporting." : "No major cleanup blockers were detected."}`
  };
}

export const sampleDetectiveRows: CsvRow[] = [
  { Order_ID: "A100", Product_Family: "Azure", Region: "East", Revenue_USD: 12000, Cost_USD: 4200, Renewal_Status: "Renewed", Support_Tickets: 3, NPS_Score: 9, Customer_Segment: "Enterprise", Sales_Rep: "Ava" },
  { Order_ID: "A101", Product_Family: "M365", Region: "West", Revenue_USD: "", Cost_USD: 2300, Renewal_Status: "At Risk", Support_Tickets: 14, NPS_Score: 4, Customer_Segment: "SMB", Sales_Rep: "" },
  { Order_ID: "A102", Product_Family: "Dynamics", Region: "East", Revenue_USD: 8000, Cost_USD: 9100, Renewal_Status: "Renewed", Support_Tickets: 2, NPS_Score: 11, Customer_Segment: "Mid-Market", Sales_Rep: "Mia" },
  { Order_ID: "A102", Product_Family: "Dynamics", Region: "East", Revenue_USD: 8000, Cost_USD: 9100, Renewal_Status: "Renewed", Support_Tickets: 2, NPS_Score: 11, Customer_Segment: "Mid-Market", Sales_Rep: "Mia" },
  { Order_ID: "A103", Product_Family: "Azure", Region: "South", Revenue_USD: 54000, Cost_USD: 8000, Renewal_Status: "Pending", Support_Tickets: 27, NPS_Score: 6, Customer_Segment: "Enterprise", Sales_Rep: "Noah" },
  { Order_ID: "A104", Product_Family: "Security", Region: "North", Revenue_USD: -400, Cost_USD: 500, Renewal_Status: "Churned", Support_Tickets: 7, NPS_Score: 2, Customer_Segment: "SMB", Sales_Rep: "Liam" }
];
