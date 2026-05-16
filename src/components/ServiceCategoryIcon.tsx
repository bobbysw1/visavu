/**
 * Per-category icon + palette for service category headers and cards.
 *
 * Kept in its own module so /services and /services/[category] (and any
 * future ResultCard "next-step" panel) share a single visual vocabulary.
 * Lucide icons render at any size without a separate sprite sheet.
 */
import {
  Plane,
  HeartPulse,
  Syringe,
  Fingerprint,
  Stethoscope,
  Camera,
  Scale,
  type LucideIcon,
} from "lucide-react";
import type { ServiceCategory } from "@/lib/services";

type CategoryVisual = { Icon: LucideIcon; bg: string; fg: string };

export const CATEGORY_VISUAL: Record<ServiceCategory, CategoryVisual> = {
  travel_insurance: {
    Icon: Plane,
    bg: "bg-sky-100 dark:bg-sky-950/40",
    fg: "text-sky-700 dark:text-sky-300",
  },
  health_insurance: {
    Icon: HeartPulse,
    bg: "bg-rose-100 dark:bg-rose-950/40",
    fg: "text-rose-700 dark:text-rose-300",
  },
  vaccinations: {
    Icon: Syringe,
    bg: "bg-emerald-100 dark:bg-emerald-950/40",
    fg: "text-emerald-700 dark:text-emerald-300",
  },
  biometrics: {
    Icon: Fingerprint,
    bg: "bg-violet-100 dark:bg-violet-950/40",
    fg: "text-violet-700 dark:text-violet-300",
  },
  medical_checks: {
    Icon: Stethoscope,
    bg: "bg-amber-100 dark:bg-amber-950/40",
    fg: "text-amber-700 dark:text-amber-300",
  },
  passport_photos: {
    Icon: Camera,
    bg: "bg-cyan-100 dark:bg-cyan-950/40",
    fg: "text-cyan-700 dark:text-cyan-300",
  },
  legal_services: {
    Icon: Scale,
    bg: "bg-indigo-100 dark:bg-indigo-950/40",
    fg: "text-indigo-700 dark:text-indigo-300",
  },
};

export function ServiceCategoryIcon({
  category,
  size = 28,
  className = "",
}: {
  category: ServiceCategory;
  size?: number;
  className?: string;
}) {
  const { Icon, bg, fg } = CATEGORY_VISUAL[category];
  return (
    <div
      className={`shrink-0 rounded-xl p-3 ${bg} ${fg} ring-1 ring-black/5 dark:ring-white/10 ${className}`}
    >
      <Icon size={size} strokeWidth={1.6} aria-hidden />
    </div>
  );
}
