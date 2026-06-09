import type { AnalyzeFormInput } from "@/lib/types";
import { getConfiguredEnv } from "@/lib/env";

type GitHubPr = {
  title?: string;
  body?: string | null;
  html_url?: string;
};

type GitHubFile = {
  filename?: string;
  status?: string;
  additions?: number;
  deletions?: number;
  patch?: string;
};

function parseGitHubPullUrl(url: string) {
  const match = url.trim().match(/^https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/pull\/(\d+)/i);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    pullNumber: match[3]
  };
}

async function githubJson<T>(url: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  const token = getConfiguredEnv("GITHUB_TOKEN");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function enrichInputFromGitHub(input: AnalyzeFormInput): Promise<AnalyzeFormInput> {
  if (input.mode === "fix" || input.codeDiff.trim() || !input.prUrl.trim()) return input;

  const parsed = parseGitHubPullUrl(input.prUrl);
  if (!parsed) return input;

  const baseUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.pullNumber}`;
  const [pullRequest, files] = await Promise.all([
    githubJson<GitHubPr>(baseUrl),
    githubJson<GitHubFile[]>(`${baseUrl}/files?per_page=100`)
  ]);

  const patches = files
    .map((file) => {
      const header = [
        `File: ${file.filename || "unknown"}`,
        `Status: ${file.status || "modified"}`,
        `Additions: ${file.additions ?? 0}`,
        `Deletions: ${file.deletions ?? 0}`
      ].join("\n");
      return `${header}\n${file.patch || "No text patch available for this file."}`;
    })
    .join("\n\n---\n\n")
    .slice(0, 60000);

  return {
    ...input,
    prTitle: input.prTitle || pullRequest.title || "",
    prDescription:
      input.prDescription ||
      [
        pullRequest.body || "No PR description was provided in GitHub.",
        pullRequest.html_url ? `GitHub PR: ${pullRequest.html_url}` : ""
      ]
        .filter(Boolean)
        .join("\n\n"),
    codeDiff: patches
  };
}
