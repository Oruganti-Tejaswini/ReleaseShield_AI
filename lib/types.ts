export type Severity = "Low" | "Medium" | "High" | "Critical";
export type WorkStatus = "Completed" | "Partially Completed" | "Blocked";
export type ReleaseDecision = "Go" | "Go with Caution" | "No-Go";

export interface AnalyzeFormInput {
  mode?: "audit" | "fix";
  codeLanguage: string;
  prUrl: string;
  prTitle: string;
  prDescription: string;
  codeDiff: string;
  errorLogs: string;
  testLogs: string;
  communicationNotes: string;
  managerName: string;
  yourName: string;
}

export interface SecurityFinding {
  type: string;
  severity: Severity;
  evidence: string;
  why_it_matters: string;
  suggested_fix: string;
}

export interface CommunicationTracking {
  pr_discussed: "Yes" | "No" | "Unclear";
  channels_found: string[];
  approval_status: "Approved" | "Pending" | "Rejected" | "Unclear";
  manager_informed: "Yes" | "No" | "Unclear";
  pending_questions: string[];
  evidence: string[];
}

export interface TestReadiness {
  status: "Passed" | "Partial" | "Failed" | "Missing";
  passed_tests: string[];
  missing_tests: string[];
  failed_tests: string[];
  evidence: string[];
}

export interface FixCenter {
  validation_status: "Valid" | "Invalid" | "Needs Review";
  syntax_valid: boolean;
  detected_language: string;
  validation_details: string[];
  root_cause: string;
  error_explanation: string;
  fixed_code: string;
  fix_steps: string[];
  risk_of_fix: "Low" | "Medium" | "High";
  test_suggestions: string[];
}

export interface ManagerUpdate {
  subject: string;
  email_body: string;
  chat_message: string;
  notification: string;
}

export interface OutlookMailTracking {
  scanned_days: number;
  connected: boolean;
  related_mail_found: boolean;
  match_confidence: "Low" | "Medium" | "High";
  matched_subject: string;
  matched_from: string;
  matched_date: string;
  matched_evidence: string[];
  note: string;
}

export interface AnalysisResult {
  work_status: WorkStatus;
  release_decision: ReleaseDecision;
  release_readiness_score: number;
  security_leakage_score: Severity;
  pr_summary: string;
  main_risks: string[];
  security_findings: SecurityFinding[];
  communication_tracking: CommunicationTracking;
  test_readiness: TestReadiness;
  fix_center: FixCenter;
  outlook_mail_tracking: OutlookMailTracking;
  manager_update: ManagerUpdate;
  next_steps: string[];
}
