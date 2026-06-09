import type { AnalyzeFormInput } from "@/lib/types";

export const initialForm: AnalyzeFormInput = {
  mode: "audit",
  codeLanguage: "javascript",
  prUrl: "",
  prTitle: "",
  prDescription: "",
  codeDiff: "",
  errorLogs: "",
  testLogs: "",
  communicationNotes: "",
  managerName: "",
  yourName: ""
};

export const sampleForm: AnalyzeFormInput = {
  mode: "audit",
  codeLanguage: "javascript",
  prUrl: "https://github.com/acme/payments/pull/42",
  prTitle: "Add payment retry logic for failed transactions",
  prDescription:
    "This PR adds retry logic for failed payment attempts and updates the payment status API.",
  codeDiff: `const API_KEY = "EXAMPLE_SECRET_PAYMENT_RETRY_KEY";
auditLog("Customer card token:", cardToken);

async function retryPayment(paymentId) {
  const res = await fetch("https://internal-payments.company.com/retry", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + API_KEY
    },
    body: JSON.stringify({ paymentId })
  });

  return res.json();
}`,
  errorLogs:
    "TypeError: Cannot read properties of undefined reading 'json'\nPayment retry failed when API response was empty.",
  testLogs: "Unit tests passed: 18/18\nIntegration tests: not run\nQA status: pending",
  communicationNotes:
    "Outlook mail from Priya <priya@example.com>, subject: Payment retry PR progress, date: this week. Rahul said the retry logic looks good, but QA needs integration test proof before release.\nPriya mentioned that manager approval is needed before merging.\nThe payment retry PR was discussed in today's release call. Work is mostly complete, but QA validation is still pending.",
  managerName: "Manager",
  yourName: "Demo User"
};

export const sampleFixForm: AnalyzeFormInput = {
  mode: "fix",
  codeLanguage: "python",
  prUrl: "",
  prTitle: "Fix Python pricing helper",
  prDescription: "Code issue scan for a pricing helper.",
  codeDiff: `def calculate_total(items):
    total = 0
    for item in items:
        total += item["price"] * item["qty"]
    return total

print(calculate_total(None))`,
  errorLogs:
    "TypeError: 'NoneType' object is not iterable\nThe helper crashes when items is None.",
  testLogs: "",
  communicationNotes:
    "Need the function to handle empty input and malformed item records safely.",
  managerName: "Manager",
  yourName: "Demo User"
};
