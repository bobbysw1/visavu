import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConsultationIntakeForm } from "@/components/ConsultationIntakeForm";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Book your consultation — Visavu",
  description: "Tell us about your situation. The adviser will be prepared when you arrive.",
  alternates: { canonical: absoluteUrl("/consultation/book") },
};

const crumbs = [
  { href: "/", label: "Home" },
  { href: "/consultation", label: "Consultation" },
  { href: "/consultation/book", label: "Book" },
];

export default function ConsultationBookPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <Breadcrumbs crumbs={crumbs} />

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Tell us your situation</h1>
        <p className="text-neutral-700 dark:text-neutral-300">
          Three minutes to complete. The more specific you are, the more
          useful the consultation. All fields except email are optional —
          but blanks mean the adviser has to ask in the call.
        </p>
      </header>

      <ConsultationIntakeForm />

      <footer className="text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-4">
        <p>
          Your information is sent only to the matched adviser and used to
          prepare your consultation. We do not share with third parties.
        </p>
      </footer>
    </div>
  );
}
