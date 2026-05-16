/**
 * GlossaryText — auto-links known visa-vocab terms inside a string.
 *
 * Walks the input text and replaces every glossary match with an
 * external link to the authoritative source (Australian Home Affairs,
 * USCIS, gov.uk, etc.). Designed for visa requirement strings that
 * mention things like "MLTSSL", "Skills Assessment from Engineers
 * Australia / ACS / VETASSESS", "Subclass 189", "Express Entry CRS".
 *
 * Each linked term gets a tooltip explaining what it is + a small
 * external-link glyph so users know they're leaving the page.
 *
 * Important: this only handles linear text. Don't pass it markup —
 * it splits at glossary boundaries and rebuilds with `<a>` nodes.
 */
import { ExternalLink } from "lucide-react";
import { firstGlossaryMatch } from "@/content/visaGlossary";

export function GlossaryText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderTokens(text)}</span>;
}

function renderTokens(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let safety = 0;
  while (cursor < text.length && safety < 200) {
    safety += 1;
    const remainder = text.slice(cursor);
    const match = firstGlossaryMatch(remainder);
    if (!match) {
      nodes.push(remainder);
      break;
    }
    // Push the pre-match text + the linked term + advance the cursor.
    if (match.index > 0) {
      nodes.push(remainder.slice(0, match.index));
    }
    const word = remainder.slice(match.index, match.index + match.length);
    nodes.push(
      <a
        key={`${cursor}:${match.entry.term}`}
        href={match.entry.url}
        target="_blank"
        rel="noreferrer noopener"
        title={match.entry.tooltip}
        className="text-blue-700 dark:text-blue-300 underline decoration-dotted decoration-blue-300/70 hover:decoration-blue-500 underline-offset-2 inline-flex items-baseline gap-0.5"
      >
        {word}
        <ExternalLink size={10} aria-hidden className="opacity-60" />
      </a>,
    );
    cursor += match.index + match.length;
  }
  return nodes;
}
