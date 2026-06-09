import type { AnalysisResult, AnalyzeFormInput } from "@/lib/types";
import { buildAnalysisPrompt } from "@/lib/prompts";
import { getConfiguredEnv, hasAzureOpenAIConfig } from "@/lib/env";

type AzureChatResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
};

function cleanEndpoint(endpoint: string) {
  return endpoint.replace(/\/+$/, "");
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  return match ? match[0] : "";
}

export async function analyzeWithMicrosoftAI(input: AnalyzeFormInput): Promise<AnalysisResult | null> {
  if (!hasAzureOpenAIConfig()) return null;

  const endpoint = cleanEndpoint(getConfiguredEnv("AZURE_OPENAI_ENDPOINT") as string);
  const deployment = encodeURIComponent(getConfiguredEnv("AZURE_OPENAI_DEPLOYMENT_NAME") as string);
  const apiVersion = getConfiguredEnv("AZURE_OPENAI_API_VERSION") || "2024-10-21";
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": getConfiguredEnv("AZURE_OPENAI_API_KEY") as string
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "Return only valid JSON. Do not include markdown, comments, or extra prose. Use the exact schema requested by the user prompt."
        },
        {
          role: "user",
          content: buildAnalysisPrompt(input)
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`Microsoft AI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as AzureChatResponse;
  const content = data.choices?.[0]?.message?.content ?? "";
  const json = extractJson(content);
  if (!json) return null;

  return JSON.parse(json) as AnalysisResult;
}
