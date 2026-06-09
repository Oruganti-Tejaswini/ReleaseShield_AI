import ts from "typescript";

export type CodeValidationStatus = "Valid" | "Invalid" | "Needs Review";

export interface CodeValidationResult {
  status: CodeValidationStatus;
  syntax_valid: boolean;
  detected_language: string;
  summary: string;
  details: string[];
}

function balancedDelimiters(code: string) {
  const pairs: Record<string, string> = {
    "(": ")",
    "[": "]",
    "{": "}"
  };
  const closers = new Set(Object.values(pairs));
  const stack: string[] = [];

  for (const char of code) {
    if (pairs[char]) {
      stack.push(pairs[char]);
    } else if (closers.has(char) && stack.pop() !== char) {
      return false;
    }
  }

  return stack.length === 0;
}

function validateScript(code: string, language: string): CodeValidationResult {
  const isTypeScript = language === "typescript";
  const output = ts.transpileModule(code, {
    compilerOptions: {
      noEmitOnError: false,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React
    },
    fileName: isTypeScript ? "input.ts" : "input.js",
    reportDiagnostics: true
  });
  const diagnostics = output.diagnostics ?? [];
  const errors = diagnostics
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, " ");
      return diagnostic.start === undefined ? message : `${message} near character ${diagnostic.start}`;
    });

  return {
    status: errors.length ? "Invalid" : "Valid",
    syntax_valid: errors.length === 0,
    detected_language: isTypeScript ? "TypeScript" : "JavaScript",
    summary: errors.length
      ? `${isTypeScript ? "TypeScript" : "JavaScript"} compiler diagnostics found syntax issues.`
      : `${isTypeScript ? "TypeScript" : "JavaScript"} syntax parsed successfully.`,
    details: errors.length ? errors : ["No syntax diagnostics were reported by the TypeScript compiler parser."]
  };
}

function validateJson(code: string): CodeValidationResult {
  try {
    JSON.parse(code);
    return {
      status: "Valid",
      syntax_valid: true,
      detected_language: "JSON",
      summary: "JSON parsed successfully.",
      details: ["The payload is valid JSON syntax."]
    };
  } catch (error) {
    return {
      status: "Invalid",
      syntax_valid: false,
      detected_language: "JSON",
      summary: "JSON parsing failed.",
      details: [error instanceof Error ? error.message : "Invalid JSON syntax."]
    };
  }
}

function validatePython(code: string): CodeValidationResult {
  const details: string[] = [];
  const lines = code.split("\n");

  if (!balancedDelimiters(code)) details.push("Parentheses, brackets, or braces are not balanced.");
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (/^(def|class|if|elif|else|for|while|try|except|finally|with)\b/.test(trimmed) && !trimmed.endsWith(":")) {
      details.push(`Line ${index + 1}: Python block statement should end with a colon.`);
    }
    if (/^\s+(def|class)\b/.test(line) && line.search(/\S/) % 4 !== 0) {
      details.push(`Line ${index + 1}: indentation is unusual; use consistent four-space blocks.`);
    }
  });

  return {
    status: details.length ? "Needs Review" : "Valid",
    syntax_valid: details.length === 0,
    detected_language: "Python",
    summary: details.length
      ? "Static Python checks found syntax or indentation concerns."
      : "Static Python checks did not find obvious syntax blockers.",
    details: details.length ? details : ["Balanced delimiters and common Python block syntax look okay."]
  };
}

function validateJava(code: string): CodeValidationResult {
  const details: string[] = [];
  if (!balancedDelimiters(code)) details.push("Parentheses, brackets, or braces are not balanced.");
  if (!/class\s+\w+/.test(code)) details.push("No Java class declaration was found.");
  if (/System\.out\.println\([^;]*\)\s*$/m.test(code)) details.push("A statement may be missing a semicolon.");

  return {
    status: details.length ? "Needs Review" : "Valid",
    syntax_valid: details.length === 0,
    detected_language: "Java",
    summary: details.length
      ? "Static Java checks found compile-readiness concerns."
      : "Static Java checks did not find obvious compile blockers.",
    details: details.length ? details : ["Class structure and delimiters look compile-ready at a static scan level."]
  };
}

function validateHtml(code: string): CodeValidationResult {
  const details: string[] = [];
  if (!/<[a-z][\s\S]*>/i.test(code)) details.push("No HTML tags were detected.");
  if (!/<\/[a-z][\s\S]*>/i.test(code) && !/<(br|hr|img|input|meta|link)\b/i.test(code)) {
    details.push("No closing tags or known void tags were detected.");
  }
  if (/<script\b/i.test(code) && !/<\/script>/i.test(code)) details.push("A script tag appears to be missing its closing tag.");
  if (/<style\b/i.test(code) && !/<\/style>/i.test(code)) details.push("A style tag appears to be missing its closing tag.");

  return {
    status: details.length ? "Needs Review" : "Valid",
    syntax_valid: details.length === 0,
    detected_language: "HTML",
    summary: details.length
      ? "Static HTML checks found markup concerns."
      : "Static HTML checks did not find obvious markup blockers.",
    details: details.length ? details : ["Markup tags look structurally reasonable in this static scan."]
  };
}

export function validateCode(language: string, code: string): CodeValidationResult {
  const normalized = language.toLowerCase();
  if (!code.trim()) {
    return {
      status: "Invalid",
      syntax_valid: false,
      detected_language: language || "Unknown",
      summary: "No code was provided.",
      details: ["Paste code or upload a source file before scanning."]
    };
  }

  if (normalized === "javascript" || normalized === "typescript") return validateScript(code, normalized);
  if (normalized === "json") return validateJson(code);
  if (normalized === "python") return validatePython(code);
  if (normalized === "java") return validateJava(code);
  if (normalized === "html") return validateHtml(code);

  return {
    status: balancedDelimiters(code) ? "Needs Review" : "Invalid",
    syntax_valid: balancedDelimiters(code),
    detected_language: language || "Other",
    summary: "Generic static scan completed.",
    details: balancedDelimiters(code)
      ? ["Delimiters are balanced. Select a specific language for stronger syntax validation."]
      : ["Parentheses, brackets, or braces are not balanced."]
  };
}
