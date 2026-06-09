import type { SecurityFinding, Severity } from "@/lib/types";

type ScannerPattern = {
  type: string;
  severity: Severity;
  regex: RegExp;
  why_it_matters: string;
  suggested_fix: string;
};

const patterns: ScannerPattern[] = [
  {
    type: "Payment secret key",
    severity: "Critical",
    regex: /(sk_(live|test)_[A-Za-z0-9_]+|EXAMPLE_SECRET_[A-Z0-9_]+)/g,
    why_it_matters: "A payment secret key can authorize payment operations if exposed.",
    suggested_fix: "Move the key to a server-side environment variable and rotate the leaked value."
  },
  {
    type: "AWS access key",
    severity: "Critical",
    regex: /AKIA[0-9A-Z]{16}/g,
    why_it_matters: "AWS access keys can grant cloud account access.",
    suggested_fix: "Revoke the key, create a scoped replacement, and load it from secure configuration."
  },
  {
    type: "Bearer token",
    severity: "Critical",
    regex: /Bearer\s+[A-Za-z0-9._~+/=-]{12,}/g,
    why_it_matters: "Bearer tokens can impersonate users or services.",
    suggested_fix: "Remove the token from source and rotate it in the identity provider."
  },
  {
    type: "Private key",
    severity: "Critical",
    regex: /-----BEGIN\s+(RSA\s+|EC\s+|OPENSSH\s+)?PRIVATE KEY-----[\s\S]*?-----END\s+(RSA\s+|EC\s+|OPENSSH\s+)?PRIVATE KEY-----/g,
    why_it_matters: "Private keys can unlock encrypted services or deploy credentials.",
    suggested_fix: "Delete the key from code, rotate it, and store the replacement in a secret manager."
  },
  {
    type: "Hardcoded password",
    severity: "High",
    regex: /(password|passwd|pwd)\s*[:=]\s*["'][^"'\n]{4,}["']/gi,
    why_it_matters: "Hardcoded passwords are easy to leak and difficult to rotate safely.",
    suggested_fix: "Use environment-backed secrets and avoid committing credentials."
  },
  {
    type: "Database URL",
    severity: "High",
    regex: /(postgres|mysql|mongodb|redis):\/\/[^\s"']+/gi,
    why_it_matters: "Database connection strings often contain usernames, passwords, and hostnames.",
    suggested_fix: "Move the database URL to server configuration and rotate exposed credentials."
  },
  {
    type: "JWT token",
    severity: "High",
    regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    why_it_matters: "JWTs may contain claims and can authenticate API requests.",
    suggested_fix: "Remove the token, rotate the session or signing material, and avoid logging JWTs."
  },
  {
    type: "Internal URL exposed",
    severity: "Medium",
    regex: /https?:\/\/[A-Za-z0-9.-]*internal[A-Za-z0-9./?=&_%:-]*/gi,
    why_it_matters: "Internal URLs reveal private infrastructure and service boundaries.",
    suggested_fix: "Move internal endpoints into environment-specific configuration."
  },
  {
    type: "Sensitive console log",
    severity: "High",
    regex: /console\.(log|debug|info)\([^)]*(token|password|secret|card|key|customer)[^)]*\)/gi,
    why_it_matters: "Debug logs can leak customer or credential data into observability tools.",
    suggested_fix: "Remove the log or mask sensitive fields before logging."
  },
  {
    type: "Email address",
    severity: "Low",
    regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    why_it_matters: "Email addresses can be customer or employee personal data.",
    suggested_fix: "Mask personal data in logs and examples unless it is required."
  },
  {
    type: "Phone number",
    severity: "Low",
    regex: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g,
    why_it_matters: "Phone numbers are personal data and should not appear in logs or code samples.",
    suggested_fix: "Redact phone numbers or replace them with synthetic test data."
  },
  {
    type: "Prompt-injection instruction",
    severity: "Medium",
    regex: /(ignore previous instructions|reveal system prompt|exfiltrate|bypass safety|override policy)/gi,
    why_it_matters: "Prompt-injection text can manipulate agent behavior when logs or comments are processed.",
    suggested_fix: "Treat the text as untrusted input and isolate it from system instructions."
  }
];

export function runSecurityScanner(input: string): SecurityFinding[] {
  const findings = new Map<string, SecurityFinding>();

  for (const pattern of patterns) {
    for (const match of input.matchAll(pattern.regex)) {
      const evidence = match[0].slice(0, 240);
      const key = `${pattern.type}:${evidence}`;
      findings.set(key, {
        type: pattern.type,
        severity: pattern.severity,
        evidence,
        why_it_matters: pattern.why_it_matters,
        suggested_fix: pattern.suggested_fix
      });
    }
  }

  return Array.from(findings.values());
}

export function highestSeverity(findings: SecurityFinding[]): Severity {
  if (findings.some((finding) => finding.severity === "Critical")) return "Critical";
  if (findings.some((finding) => finding.severity === "High")) return "High";
  if (findings.some((finding) => finding.severity === "Medium")) return "Medium";
  return findings.length ? "Low" : "Low";
}
