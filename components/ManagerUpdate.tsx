"use client";

import { useState } from "react";
import { Mail, MessageSquareText, SearchCheck, Sparkles, X } from "lucide-react";
import type { ManagerUpdate as ManagerUpdateType, OutlookMailTracking } from "@/lib/types";
import { CopyButton } from "@/components/CopyButton";

export function ManagerUpdate({
  update,
  outlook,
  codeLooksGood
}: {
  update: ManagerUpdateType;
  outlook?: OutlookMailTracking;
  codeLooksGood?: boolean;
}) {
  const [showDraft, setShowDraft] = useState(false);
  const [wantsUpdate, setWantsUpdate] = useState<boolean | null>(null);
  const [managerName, setManagerName] = useState("");
  const mailFound = Boolean(outlook?.related_mail_found);
  const shouldGateDraft = codeLooksGood && mailFound;
  const emailBody = managerName
    ? update.email_body.replace(/\[Manager Name\]|Manager/g, managerName)
    : update.email_body;
  const chatMessage = managerName
    ? `Hi ${managerName}, ${update.chat_message}`
    : update.chat_message;

  if (shouldGateDraft && wantsUpdate === null) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-emerald-100 text-emerald-700">
            <SearchCheck className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-2xl font-bold text-emerald-950">Code looks good and related Outlook mail was found</h3>
          <p className="mt-3 leading-7 text-emerald-900">
            ReleaseShield did not find code leakage or release-blocking security issues. It also found a related mail signal from the last 30 day scan context.
          </p>
          <div className="mt-4 rounded-md bg-white/70 p-3 text-left text-sm leading-6 text-emerald-950">
            <p className="font-bold">{outlook?.matched_subject || "Related progress mail"}</p>
            <p>{outlook?.matched_evidence?.[0]}</p>
            <p className="mt-2 text-emerald-800">{outlook?.note}</p>
          </div>
          <p className="mt-4 font-semibold text-emerald-950">Do you want to prepare a progress update mail?</p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setWantsUpdate(true)}
              className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 font-bold text-white transition hover:bg-reef"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setWantsUpdate(false)}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-emerald-300 bg-white px-5 font-bold text-emerald-900 transition hover:border-ink"
            >
              <X className="h-4 w-4" />
              No
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (shouldGateDraft && wantsUpdate === false) {
    return (
      <div className="rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm">
        <h3 className="text-xl font-bold">No draft generated</h3>
        <p className="mt-2 text-ink/60">The audit result is available, and no manager update draft was created.</p>
        <button
          type="button"
          onClick={() => setWantsUpdate(null)}
          className="mt-4 inline-flex h-10 items-center rounded-md border border-ink/10 px-4 text-sm font-bold text-ink/70"
        >
          Reopen prompt
        </button>
      </div>
    );
  }

  if (wantsUpdate === true && !showDraft) {
    return (
      <div className="rounded-md border border-ink/10 bg-white p-6 shadow-sm">
        <div className="mx-auto max-w-xl">
          <h3 className="text-2xl font-bold">Who should receive the progress update?</h3>
          <p className="mt-2 leading-7 text-ink/60">Enter the manager name, then generate the draft for review.</p>
          <label className="mt-5 grid gap-1.5">
            <span className="text-sm font-semibold">Manager Name</span>
            <input
              value={managerName}
              onChange={(event) => setManagerName(event.target.value)}
              className="w-full rounded-md border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/10"
              placeholder="Manager name"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowDraft(true)}
            disabled={!managerName.trim()}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ink px-5 font-bold text-white transition hover:bg-reef disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            Draft progress update
          </button>
        </div>
      </div>
    );
  }

  if (!showDraft) {
    return (
      <div className="rounded-md border border-ink/10 bg-white p-6 shadow-sm">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-reef/10 text-reef">
            <Mail className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-2xl font-bold">Manager update is ready to prepare</h3>
          <p className="mt-3 leading-7 text-ink/65">
            ReleaseShield found enough evidence to prepare a manager-ready email and chat message.
            Generate the draft only when you want to review and copy it.
          </p>
          <button
            type="button"
            onClick={() => setWantsUpdate(true)}
            className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 font-bold text-white transition hover:bg-reef"
          >
            <Sparkles className="h-4 w-4" />
            Generate draft update
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-800">
        {update.notification}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-ink/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-bold">
              <Mail className="h-4 w-4 text-reef" />
              Manager Email
            </h3>
            <CopyButton value={`${update.subject}\n\n${emailBody}`} label="Copy email" />
          </div>
          <p className="rounded-md bg-ink/[0.04] p-3 text-sm font-bold">{update.subject}</p>
          <pre className="mt-3 whitespace-pre-wrap rounded-md bg-ink/[0.04] p-3 text-sm leading-6 text-ink/70">
            {emailBody}
          </pre>
        </div>

        <div className="rounded-md border border-ink/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-bold">
              <MessageSquareText className="h-4 w-4 text-violet" />
              Chat Message
            </h3>
            <CopyButton value={chatMessage} label="Copy chat" />
          </div>
          <p className="rounded-md bg-ink/[0.04] p-4 leading-7 text-ink/70">{chatMessage}</p>
        </div>
      </div>
    </div>
  );
}
