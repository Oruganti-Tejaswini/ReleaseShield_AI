const PLACEHOLDER_PATTERNS = [
  "replace_with",
  "your_",
  "optional",
  "example",
  "changeme",
  "todo"
];

export function getConfiguredEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value) return undefined;

  const normalized = value.toLowerCase();
  if (PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return undefined;
  }

  return value;
}

export function hasAzureOpenAIConfig() {
  return Boolean(
    getConfiguredEnv("AZURE_OPENAI_API_KEY") &&
      getConfiguredEnv("AZURE_OPENAI_ENDPOINT") &&
      getConfiguredEnv("AZURE_OPENAI_DEPLOYMENT_NAME")
  );
}
