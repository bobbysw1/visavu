import Link from "next/link";
import { flagEmoji, nameFor } from "@/lib/countries";

export function RouteCard({
  passport,
  destination,
  purpose,
  hint,
}: {
  passport: string;
  destination: string;
  purpose?: string;
  hint?: string;
}) {
  const href = purpose
    ? `/${passport.toLowerCase()}/${destination.toLowerCase()}?purpose=${purpose}`
    : `/${passport.toLowerCase()}/${destination.toLowerCase()}`;
  return (
    <Link
      href={href}
      prefetch={false}
      className="group flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition"
    >
      <div className="flex items-center gap-1 text-2xl shrink-0" aria-hidden>
        <span>{flagEmoji(passport)}</span>
        <span className="text-neutral-400 text-base">→</span>
        <span>{flagEmoji(destination)}</span>
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">
          {nameFor(passport)} → {nameFor(destination)}
        </p>
        {hint && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{hint}</p>
        )}
      </div>
    </Link>
  );
}
