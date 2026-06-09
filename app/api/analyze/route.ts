import { NextResponse } from "next/server";
import type { AnalysisResult, AnalyzeFormInput } from "@/lib/types";
import { analyzeWithMicrosoftAI } from "@/lib/microsoftAI";
import { createFallbackAnalysis } from "@/lib/fallbackAnalysis";
import { enrichInputFromGitHub } from "@/lib/github";
import { runSecurityScanner } from "@/lib/securityScanner";

export const runtime = "nodejs";
export const maxDuration = 30;

const AI_PROVIDER_TIMEOUT_MS = 8000;

function normalizeBody(body: Partial<AnalyzeFormInput>): AnalyzeFormInput {
  return {
    mode: body.mode ?? "audit",
    codeLanguage: body.codeLanguage ?? "javascript",
    prUrl: body.prUrl ?? "",
    prTitle: body.prTitle ?? "",
    prDescription: body.prDescription ?? "",
    codeDiff: body.codeDiff ?? "",
    errorLogs: body.errorLogs ?? "",
    testLogs: body.testLogs ?? "",
    communicationNotes: body.communicationNotes ?? "",
    managerName: body.managerName ?? "",
    yourName: body.yourName ?? ""
  };
}

function normalizeAnalysisResult(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    outlook_mail_tracking: {
      scanned_days: 0,
      connected: false,
      related_mail_found: false,
      match_confidence: "Low",
      matched_subject: "",
      matched_from: "",
      matched_date: "",
      matched_evidence: [],
      note: ""
    },
    manager_update: {
      ...result.manager_update,
      notification: "Mail/message is ready to send to the manager."
    }
  };
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T | null> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<null>((resolve) => {
        timeout = setTimeout(() => resolve(null), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  try {
    const submittedInput = normalizeBody((await req.json()) as Partial<AnalyzeFormInput>);
    let input: AnalyzeFormInput;

    try {
      input = await enrichInputFromGitHub(submittedInput);
    } catch {
      if (submittedInput.mode !== "fix" && submittedInput.prUrl.trim() && !submittedInput.codeDiff.trim()) {
        return NextResponse.json(
          {
            error: "Unable to read changed code from the GitHub PR. Paste the changed code/diff or add a GitHub token for private repositories."
          },
          { status: 400 }
        );
      }
      input = submittedInput;
    }

    if (submittedInput.mode !== "fix" && submittedInput.prUrl.trim() && !submittedInput.codeDiff.trim() && !input.codeDiff.trim()) {
      return NextResponse.json(
        {
          error: "Unable to read changed code from the GitHub PR. Paste the changed code/diff or add a GitHub token for private repositories."
        },
        { status: 400 }
      );
    }

    const combinedInput = Object.values(input).filter(Boolean).join("\n\n");
    const ruleFindings = runSecurityScanner(combinedInput);

    try {
      const aiResult = await withTimeout(analyzeWithMicrosoftAI(input), AI_PROVIDER_TIMEOUT_MS);
      if (aiResult) {
        return NextResponse.json(normalizeAnalysisResult(aiResult));
      }
    } catch {
    }

    return NextResponse.json(createFallbackAnalysis(input, ruleFindings));
  } catch {
    return NextResponse.json(
      {
        error: "Failed to analyze request"
      },
      {
        status: 500
      }
    );
  }
}
