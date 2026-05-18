"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRY_LIST } from "@/lib/countries";

type FormState = {
  email: string;
  name: string;
  tier: "quick" | "full" | "unsure";
  passportIso2: string;
  destinationIso2: string;
  goal: string;
  currentStatus: string;
  education: string;
  workExperience: string;
  income: string;
  family: string;
  criminalRecord: "no" | "minor" | "yes";
  timeline: string;
  budget: string;
  notes: string;
};

const INIT: FormState = {
  email: "",
  name: "",
  tier: "unsure",
  passportIso2: "",
  destinationIso2: "",
  goal: "",
  currentStatus: "",
  education: "",
  workExperience: "",
  income: "",
  family: "",
  criminalRecord: "no",
  timeline: "",
  budget: "",
  notes: "",
};

export function ConsultationIntakeForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INIT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.email.includes("@")) {
      setError("Email is required so we can send you the available slots.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      router.push("/consultation/booked");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong sending your intake.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-3 text-sm text-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Contact */}
      <Field label="Your email" required>
        <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} placeholder="you@example.com" />
      </Field>
      <Field label="Your name (optional)">
        <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
      </Field>

      {/* Tier */}
      <Field label="Which consultation are you interested in?">
        <select value={form.tier} onChange={(e) => update("tier", e.target.value as FormState["tier"])} className={inputCls}>
          <option value="unsure">Not sure yet — let the adviser recommend</option>
          <option value="quick">Quick consult (£150 — 30 min written)</option>
          <option value="full">Full consult (£300 — 60 min video + PDF + 7-day follow-up)</option>
        </select>
      </Field>

      {/* Route */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your passport country">
          <CountrySelect value={form.passportIso2} onChange={(v) => update("passportIso2", v)} />
        </Field>
        <Field label="Destination country">
          <CountrySelect value={form.destinationIso2} onChange={(v) => update("destinationIso2", v)} />
        </Field>
      </div>

      <Field label="What's your goal?" helper="One line — e.g. 'work in Berlin', 'move to Lisbon with my partner', 'apply for Australian PR'">
        <input type="text" value={form.goal} onChange={(e) => update("goal", e.target.value)} className={inputCls} placeholder="Move to Spain to work remotely" />
      </Field>

      {/* Current status */}
      <Field label="Your current immigration status" helper="If you're already overseas — e.g. 'Skilled Worker visa in UK', 'tourist visa in Thailand', 'home in India'">
        <input type="text" value={form.currentStatus} onChange={(e) => update("currentStatus", e.target.value)} className={inputCls} placeholder="Home in India, never lived abroad" />
      </Field>

      {/* Background */}
      <Field label="Education (highest qualification)">
        <input type="text" value={form.education} onChange={(e) => update("education", e.target.value)} className={inputCls} placeholder="MSc Computer Science, Imperial College London" />
      </Field>
      <Field label="Work (role + years)">
        <input type="text" value={form.workExperience} onChange={(e) => update("workExperience", e.target.value)} className={inputCls} placeholder="Senior software engineer, 8 years" />
      </Field>
      <Field label="Annual income (currency)" helper="Approximate — points-based routes care about this">
        <input type="text" value={form.income} onChange={(e) => update("income", e.target.value)} className={inputCls} placeholder="£65,000 / year" />
      </Field>
      <Field label="Family travelling with you" helper="Spouse / partner / children — and their nationalities">
        <input type="text" value={form.family} onChange={(e) => update("family", e.target.value)} className={inputCls} placeholder="Wife (Indian), 2 children under 12" />
      </Field>

      {/* Critical disclosures */}
      <Field label="Criminal record?" helper="Affects nearly all visa routes — be honest, your adviser handles this carefully">
        <select value={form.criminalRecord} onChange={(e) => update("criminalRecord", e.target.value as FormState["criminalRecord"])} className={inputCls}>
          <option value="no">No criminal record</option>
          <option value="minor">Minor / spent — discuss in call</option>
          <option value="yes">Yes, unspent — discuss in call</option>
        </select>
      </Field>

      {/* Logistics */}
      <Field label="Timeline" helper="When do you want this to happen?">
        <input type="text" value={form.timeline} onChange={(e) => update("timeline", e.target.value)} className={inputCls} placeholder="Apply within 3 months, move within 6" />
      </Field>
      <Field label="Budget for the visa process" helper="Fees, professional services, relocation — rough range">
        <input type="text" value={form.budget} onChange={(e) => update("budget", e.target.value)} className={inputCls} placeholder="£5,000-£10,000" />
      </Field>

      <Field label="Anything else the adviser should know?">
        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={4} className={`${inputCls} resize-y`} />
      </Field>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          By submitting you agree to be contacted by Visavu and the matched adviser.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-400 text-white font-semibold px-6 py-3 transition shrink-0"
        >
          {busy ? "Submitting…" : "Send intake"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-blue-500";

function Field({ label, helper, required, children }: { label: string; helper?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {label}{required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {helper && <p className="text-xs text-neutral-500 dark:text-neutral-400">{helper}</p>}
      {children}
    </div>
  );
}

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">— pick a country —</option>
      {COUNTRY_LIST.map((c) => (
        <option key={c.iso2} value={c.iso2}>{c.name}</option>
      ))}
    </select>
  );
}
