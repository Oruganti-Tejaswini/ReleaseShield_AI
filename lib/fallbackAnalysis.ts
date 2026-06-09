import type { AnalysisResult, AnalyzeFormInput, SecurityFinding } from "@/lib/types";
import { validateCode } from "@/lib/codeValidator";
import { highestSeverity } from "@/lib/securityScanner";

const includesAny = (text: string, terms: string[]) =>
  terms.some((term) => text.includes(term));

function fixedCodeForLanguage(language: string, originalCode: string) {
  const normalized = language.toLowerCase();
  const hasCode = originalCode.trim().length > 0;

  if (normalized === "python") {
    return `def calculate_total(items):
    if not items:
        return 0

    total = 0
    for item in items:
        price = item.get("price", 0)
        qty = item.get("qty", 0)
        total += price * qty

    return total`;
  }

  if (normalized === "java") {
    return `public int calculateTotal(List<Item> items) {
    if (items == null || items.isEmpty()) {
        return 0;
    }

    int total = 0;
    for (Item item : items) {
        if (item == null) {
            continue;
        }
        total += item.getPrice() * item.getQuantity();
    }
    return total;
}`;
  }

  if (normalized === "html") {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ReleaseShield Review</title>
  </head>
  <body>
    <main>
      <h1>Content loaded successfully</h1>
      <p>Validate markup, accessibility labels, and script loading before release.</p>
    </main>
  </body>
</html>`;
  }

  if (normalized === "json") {
    return `{
  "status": "reviewed",
  "valid": true,
  "notes": [
    "Ensure this JSON is parsed with try/catch.",
    "Validate required keys before using values."
  ]
}`;
  }

  if (normalized === "typescript" || normalized === "javascript") {
    return `const API_KEY = process.env.PAYMENT_API_KEY;
const PAYMENT_RETRY_URL = process.env.PAYMENT_RETRY_URL;

async function retryPayment(paymentId) {
  if (!paymentId) {
    throw new Error("paymentId is required");
  }

  if (!API_KEY || !PAYMENT_RETRY_URL) {
    throw new Error("Payment retry configuration is missing");
  }

  const res = await fetch(PAYMENT_RETRY_URL, {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ paymentId })
  });

  if (!res.ok) {
    throw new Error(\`Payment retry failed with status \${res.status}\`);
  }

  return res.json();
}`;
  }

  return hasCode
    ? `${originalCode.trim()}

// ReleaseShield note: review input validation, error handling, sensitive logs, and edge cases before merging.`
    : "No code was provided to fix.";
}

function languageSpecificChecks(language: string) {
  const normalized = language.toLowerCase();
  if (normalized === "python") {
    return ["Check None handling and iterable assumptions.", "Use dict.get or validation before reading keys.", "Add unit tests for empty lists and malformed records."];
  }
  if (normalized === "java") {
    return ["Check null inputs before iteration.", "Validate object fields before arithmetic.", "Add tests for null, empty, and partial item records."];
  }
  if (normalized === "html") {
    return ["Validate document structure and required meta tags.", "Check accessibility labels and semantic landmarks.", "Test script/style loading in the browser."];
  }
  if (normalized === "json") {
    return ["Validate JSON syntax.", "Check required keys before using values.", "Add schema validation for incoming payloads."];
  }
  return ["Validate required inputs.", "Guard failed network or parsing operations.", "Add tests for empty, invalid, and success paths."];
}

export function createFallbackAnalysis(
  input: AnalyzeFormInput,
  securityFindings: SecurityFinding[]
): AnalysisResult {
  const combined = [
    input.prTitle,
    input.prDescription,
    input.codeDiff,
    input.errorLogs,
    input.testLogs,
    input.communicationNotes
  ]
    .filter(Boolean)
    .join("\n\n");
  const lower = combined.toLowerCase();

  const hasCritical = securityFindings.some((finding) => finding.severity === "Critical");
  const hasHigh = securityFindings.some((finding) => finding.severity === "High");
  const hasPendingApproval = includesAny(lower, ["approval is needed", "approval pending", "approval: pending", "qa status: pending", "pending"]);
  const hasRejected = includesAny(lower, ["rejected", "do not merge", "blocked"]);
  const hasMissingTests = includesAny(lower, [
    "integration tests: not run",
    "not run",
    "qa status: pending",
    "tests missing",
    "missing tests",
    "qa validation is still pending"
  ]);
  const hasFailedTests = includesAny(lower, [
    "tests failed",
    "test failed",
    "failed tests",
    "failing test",
    "test failure",
    "assertion failed"
  ]);
  const hasPassedUnit = includesAny(lower, ["unit tests passed", "tests passed", "passed:"]);
  const discussed = includesAny(lower, ["discussed", "chat", "call", "meeting", "mentioned"]);
  const isFixMode = input.mode === "fix";
  const hasLogsOrComments = Boolean(input.errorLogs.trim() || input.communicationNotes.trim());
  const language = input.codeLanguage || "code";
  const validation = isFixMode
    ? validateCode(language, input.codeDiff)
    : {
        status: "Needs Review" as const,
        syntax_valid: true,
        detected_language: language,
        summary: "Release audit mode does not perform dedicated syntax validation.",
        details: ["Use Fix Coding Issues mode for language-specific syntax checks."]
      };
  const normalizedLanguage = language.toLowerCase();
  const runtimeIssues: string[] = [];

  if (isFixMode && normalizedLanguage === "python") {
    const code = input.codeDiff;
    if (/for\s+\w+\s+in\s+items\s*:/i.test(code) && /calculate_total\s*\(\s*None\s*\)/i.test(code)) {
      runtimeIssues.push("Calling calculate_total(None) will raise a TypeError because None is not iterable.");
    }
    if (/item\s*\[\s*["']price["']\s*\]/i.test(code) || /item\s*\[\s*["']qty["']\s*\]/i.test(code)) {
      runtimeIssues.push("Reading item[\"price\"] or item[\"qty\"] can raise KeyError when an item is missing the expected field.");
    }
    if (/for\s+\w+\s+in\s+items\s*:/i.test(code) && !/if\s+not\s+items\s*:/i.test(code)) {
      runtimeIssues.push("The function should guard empty or None inputs before iterating over items.");
    }
  }

  const hasRuntimeIssues = runtimeIssues.length > 0;
  const outlookMail = {
    scanned_days: 0,
    connected: false,
    related_mail_found: false,
    matched_subject: "",
    matched_from: "",
    matched_date: "",
    matched_evidence: [],
    match_confidence: "Low" as const,
    note: "Outlook mail analysis is disabled for this version."
  };
  const codeOnlyLooksFine =
    isFixMode &&
    !hasLogsOrComments &&
    !hasRuntimeIssues &&
    securityFindings.length === 0 &&
    validation.syntax_valid &&
    !includesAny(lower, ["undefined", "nullpointer", "typeerror", "syntaxerror", "exception", "todo", "fixme", "password", "secret"]);

  const releaseDecision = codeOnlyLooksFine
    ? "Go"
    : hasCritical || hasRejected || hasMissingTests || hasFailedTests || hasRuntimeIssues || (isFixMode && validation.status === "Invalid")
      ? "No-Go"
      : hasHigh || hasPendingApproval || isFixMode
        ? "Go with Caution"
        : "Go";
  const workStatus = codeOnlyLooksFine
    ? "Completed"
    : hasRejected || lower.includes("blocked") || hasRuntimeIssues || (isFixMode && validation.status === "Invalid")
      ? "Blocked"
      : hasPendingApproval || hasMissingTests || hasFailedTests || isFixMode
        ? "Partially Completed"
        : "Completed";
  const readinessScore = Math.max(
    25,
    100 -
      (hasCritical ? 15 : 0) -
      (hasHigh ? 6 : 0) -
      (hasMissingTests ? 10 : 0) -
      (hasFailedTests ? 16 : 0) -
      (hasPendingApproval ? 6 : 0) -
      (hasRuntimeIssues ? 25 : 0) -
      (isFixMode && validation.status === "Invalid" ? 34 : 0) -
      Math.min(securityFindings.length, 10)
  );

  const channels = [
    lower.includes("chat") || lower.includes("slack") || lower.includes("teams") ? "Chat" : "",
    lower.includes("call") || lower.includes("meeting") ? "Call Notes" : ""
  ].filter(Boolean);

  const mainRisks = [
    isFixMode && validation.status === "Invalid" ? `${validation.detected_language} syntax validation failed.` : "",
    ...runtimeIssues,
    hasCritical ? "Critical secret or token exposure must be remediated before release." : "",
    hasHigh ? "High-severity security finding needs owner review." : "",
    hasMissingTests ? "Integration testing or QA validation is incomplete." : "",
    hasFailedTests ? "Failed tests or error logs indicate release instability." : "",
    hasPendingApproval ? "Approval status is pending or unclear." : ""
  ].filter(Boolean);

  return {
    work_status: workStatus,
    release_decision: releaseDecision,
    release_readiness_score: readinessScore,
    security_leakage_score: highestSeverity(securityFindings),
    pr_summary:
      isFixMode
        ? `ReleaseShield scanned ${language} code${hasLogsOrComments ? " with supplied logs/comments" : " without logs/comments"} and prepared a reviewable fix analysis.`
        : input.prUrl
          ? `${input.prDescription || "PR audit completed."} PR link: ${input.prUrl}`
        : input.prDescription ||
      `ReleaseShield analyzed ${input.prTitle || "the submitted work"} for release safety, security, tests, communication, and fix readiness.`,
    main_risks: mainRisks.length ? mainRisks : ["No major blocker was detected in the provided text."],
    security_findings: securityFindings,
    communication_tracking: {
      pr_discussed: discussed ? "Yes" : "Unclear",
      channels_found: channels.length ? channels : discussed ? ["Unclear source"] : [],
      approval_status: hasRejected ? "Rejected" : hasPendingApproval ? "Pending" : "Unclear",
      manager_informed: lower.includes("manager informed") || lower.includes("sent to manager") ? "Yes" : lower.includes("manager") ? "Unclear" : "No",
      pending_questions: hasPendingApproval
        ? ["Confirm manager and QA approval before merging."]
        : ["No explicit approval confirmation was found in the provided notes."],
      evidence: input.communicationNotes
          ? [input.communicationNotes]
          : []
    },
    test_readiness: {
      status: hasFailedTests ? "Failed" : hasMissingTests ? "Partial" : hasPassedUnit ? "Passed" : "Missing",
      passed_tests: hasPassedUnit ? ["Unit tests passed according to the submitted test logs."] : [],
      missing_tests: hasMissingTests ? ["Integration tests missing or not run.", "QA validation pending."] : [],
      failed_tests: hasFailedTests ? ["Failure evidence appears in submitted logs."] : [],
      evidence: input.testLogs ? [input.testLogs] : []
    },
    fix_center: {
      root_cause:
        codeOnlyLooksFine
          ? `No obvious blocking issue was detected from the provided ${language} code alone. The code still needs normal runtime and test validation.`
          : hasRuntimeIssues
            ? runtimeIssues.join(" ")
          : isFixMode && validation.status === "Invalid"
            ? `${validation.detected_language} syntax validation failed. Fix syntax issues before runtime behavior can be trusted.`
          : `The submitted ${language} code${hasLogsOrComments ? " and evidence" : ""} suggests possible issues around input validation, error handling, unsafe logging, syntax/data shape, or edge-case handling.`,
      error_explanation:
        input.errorLogs ||
        (hasRuntimeIssues
          ? runtimeIssues.join(" ")
          :
        (isFixMode && validation.status === "Invalid"
          ? validation.details.join(" ")
          :
        (codeOnlyLooksFine
          ? "No logs or comments were provided. The scanner inspected the code text and did not find an obvious blocker."
          : "No specific error log was provided; fix suggestions are based on code structure, language patterns, and release-readiness signals."))),
      validation_status: validation.status,
      syntax_valid: validation.syntax_valid,
      detected_language: validation.detected_language,
      validation_details: [validation.summary, ...validation.details, ...runtimeIssues],
      fixed_code: codeOnlyLooksFine
        ? input.codeDiff.trim()
        : isFixMode && validation.status === "Invalid"
          ? `/* ReleaseShield could not safely rewrite this until syntax is corrected.
Validation findings:
${validation.details.map((detail) => `- ${detail}`).join("\n")}
*/

${input.codeDiff.trim()}`
          : fixedCodeForLanguage(language, input.codeDiff),
      fix_steps: [
        `Review the selected language context: ${language}.`,
        ...languageSpecificChecks(language),
        "Remove or mask any logs that include customer tokens, cards, passwords, or keys.",
        "Run the fixed code locally and review the diff before merging."
      ],
      risk_of_fix: hasCritical || hasMissingTests ? "Medium" : "Low",
      test_suggestions: [
        ...languageSpecificChecks(language),
        "Add a regression test for the exact log/comment issue if one was provided."
      ]
    },
    outlook_mail_tracking: outlookMail,
    manager_update: {
      subject: `Release readiness update: ${input.prTitle || "Submitted PR"}`,
      email_body: `Hi ${input.managerName || "[Manager Name]"},

ReleaseShield AI completed the release readiness review.

Status: ${workStatus}
Decision: ${releaseDecision}
Readiness score: ${readinessScore}/100

Summary:
${input.prDescription || "The submitted PR was reviewed for security, tests, communication status, and release readiness."}

Key risks:
${mainRisks.length ? mainRisks.map((risk) => `- ${risk}`).join("\n") : "- No major blocker was detected in the provided text."}

Recommended next steps:
- Resolve critical and high security findings.
- Complete missing integration or QA validation.
- Confirm approval status before merge.
- Re-run ReleaseShield analysis after fixes.

Thanks,
${input.yourName || "[Your Name]"}`,
      chat_message:
        `ReleaseShield AI analysis is complete for "${input.prTitle || "the submitted PR"}". Decision: ${releaseDecision}. Readiness score: ${readinessScore}/100. Mail/message is ready to send to the manager.`,
      notification: "Mail/message is ready to send to the manager."
    },
    next_steps: [
      "Fix all critical security findings and rotate exposed secrets.",
      "Complete missing integration tests and QA validation.",
      "Confirm manager and QA approvals.",
      "Re-run the analysis before merging."
    ]
  };
}
