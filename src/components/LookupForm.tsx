"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CountryCombobox } from "./CountryCombobox";
import { NotSureWizard } from "./NotSureWizard";
import {
  type Purpose,
  type PurposeCategory,
  PURPOSE_CATEGORY,
  PURPOSE_LABEL,
  PURPOSE_DESCRIPTION,
  PURPOSES_BY_CATEGORY,
  CATEGORY_LABEL,
  CATEGORY_DESCRIPTION,
  isValidPurpose,
} from "@/lib/types";
import { subpurposesFor } from "@/lib/subpurpose";

const CATEGORY_ORDER: PurposeCategory[] = ["short_stay", "long_stay", "official"];

export function LookupForm({
  initialPassport = "",
  initialDestination = "",
  initialPurpose = "tourism",
}: {
  initialPassport?: string;
  initialDestination?: string;
  initialPurpose?: Purpose;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [passport, setPassport] = useState(initialPassport || params.get("passport") || "");
  const [destination, setDestination] = useState(
    initialDestination || params.get("destination") || "",
  );

  const initialFromParam = params.get("purpose");
  const seedPurpose: Purpose =
    initialPurpose && isValidPurpose(initialPurpose)
      ? initialPurpose
      : isValidPurpose(initialFromParam ?? "")
      ? (initialFromParam as Purpose)
      : "tourism";

  const [purpose, setPurpose] = useState<Purpose>(seedPurpose);
  const [category, setCategory] = useState<PurposeCategory>(PURPOSE_CATEGORY[seedPurpose]);
  const initialSub = params.get("sub") ?? "";
  const [subId, setSubId] = useState<string>(initialSub);
  const [wizardOpen, setWizardOpen] = useState(false);

  const subpurposes = subpurposesFor(purpose);

  function pickCategory(c: PurposeCategory) {
    setCategory(c);
    const first = PURPOSES_BY_CATEGORY[c][0];
    setPurpose(first);
    setSubId("");
  }

  function pickPurpose(p: Purpose) {
    setPurpose(p);
    setSubId("");
  }

  function handleWizardPick(p: Purpose, s: string) {
    setCategory(PURPOSE_CATEGORY[p]);
    setPurpose(p);
    setSubId(s);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!passport || !destination) return;
    const qs = subId ? `?purpose=${purpose}&sub=${subId}` : `?purpose=${purpose}`;
    startTransition(() => {
      router.push(`/${passport.toLowerCase()}/${destination.toLowerCase()}${qs}`);
    });
  }

  return (
    <>
      <form
        onSubmit={submit}
        method="GET"
        action="/lookup"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Hidden inputs mirror the controlled state so a no-JS submit posts
            the same data the JS handler would push. CountryCombobox renders
            a typeahead that updates these via React state. */}
        <input type="hidden" name="passport" value={passport} />
        <input type="hidden" name="destination" value={destination} />
        <input type="hidden" name="purpose" value={purpose} />
        {subId && <input type="hidden" name="sub" value={subId} />}
        <CountryCombobox
          label="My nationality"
          mode="nationality"
          value={passport}
          onChange={setPassport}
          placeholder="e.g. British"
        />
        <CountryCombobox
          label="I'm travelling to"
          value={destination}
          onChange={setDestination}
          placeholder="e.g. Japan"
        />

        <fieldset className="sm:col-span-2 flex flex-col gap-2">
          <legend className="flex items-center justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            <span>Why are you going?</span>
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="text-xs font-medium text-blue-700 dark:text-blue-300 hover:underline"
            >
              Not sure? Help me decide
            </button>
          </legend>

          <div role="tablist" className="grid grid-cols-3 gap-1 mb-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-900">
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={category === c}
                onClick={() => pickCategory(c)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  category === c
                    ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <span className="hidden sm:inline">{CATEGORY_LABEL[c]}</span>
                <span className="sm:hidden">{CATEGORY_LABEL[c].split(",")[0]}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1 mb-2">
            {CATEGORY_DESCRIPTION[category]}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PURPOSES_BY_CATEGORY[category].map((p) => (
              <label
                key={p}
                className={`flex flex-col gap-0.5 px-3 py-2.5 rounded-lg border cursor-pointer transition ${
                  purpose === p
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <input
                  type="radio"
                  name="purpose"
                  value={p}
                  checked={purpose === p}
                  onChange={() => pickPurpose(p)}
                  className="sr-only"
                />
                <span
                  className={`text-sm font-semibold ${
                    purpose === p
                      ? "text-blue-900 dark:text-blue-200"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {PURPOSE_LABEL[p]}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  {PURPOSE_DESCRIPTION[p]}
                </span>
              </label>
            ))}
          </div>

          {subpurposes.length > 1 && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                Specific {PURPOSE_LABEL[purpose].toLowerCase()} category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSubId("")}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    subId === ""
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                      : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  Any
                </button>
                {subpurposes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubId(s.id)}
                    title={s.description}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      subId === s.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </fieldset>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={!passport || !destination || pending}
            className="w-full sm:w-auto rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Looking up…" : "Check requirements"}
          </button>
        </div>
      </form>

      <NotSureWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onPick={handleWizardPick}
      />
    </>
  );
}
