import Link from "next/link";

function renderLink(url: string, label: string, key: string): React.ReactNode {
  const isInternal = /^https?:\/\/(www\.)?visavu\.com/i.test(url);
  if (isInternal) {
    const cleanLabel =
      label === url
        ? url.replace(/^https?:\/\/(www\.)?visavu\.com/i, "visavu.com")
        : label;
    return (
      <Link
        key={key}
        href={url.replace(/^https?:\/\/(www\.)?visavu\.com/i, "")}
        className="inline-flex items-center gap-0.5 align-baseline rounded-md bg-[var(--color-muted)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] border border-[var(--color-rule-strong)] hover:border-[var(--color-ink)] text-[var(--color-ink)] font-medium px-1.5 py-px text-[12.5px] transition mx-0.5"
      >
        {cleanLabel}
        <span aria-hidden className="text-[10px] opacity-70">↗</span>
      </Link>
    );
  }
  const visible = label === url ? url.replace(/^https?:\/\//, "") : label;
  return (
    <a
      key={key}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-ink)] underline decoration-[var(--color-rule-strong)] decoration-1 underline-offset-2 hover:decoration-[var(--color-ink)]"
    >
      {visible}
    </a>
  );
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const re = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s)\]]+)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const tok = m[0];
    if (tok.startsWith("**") && tok.endsWith("**")) {
      parts.push(
        <strong key={`${keyPrefix}-b${i++}`} className="font-semibold text-[var(--color-ink)]">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("*") && tok.endsWith("*") && !tok.startsWith("**")) {
      parts.push(<em key={`${keyPrefix}-i${i++}`}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith("[")) {
      parts.push(renderLink(m[3], m[2], `${keyPrefix}-l${i++}`));
    } else {
      parts.push(renderLink(tok.replace(/[.,;)]+$/, ""), tok, `${keyPrefix}-u${i++}`));
    }
    last = idx + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let buf: string[] = [];
  let bullets: string[] = [];
  let key = 0;

  function flushParagraph() {
    if (buf.length === 0) return;
    const joined = buf.join(" ").trim();
    if (joined) {
      blocks.push(
        <p key={`p${key++}`} className="leading-relaxed text-[var(--color-ink)]/90">
          {renderInline(joined, `p${key}`)}
        </p>,
      );
    }
    buf = [];
  }
  function flushBullets() {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`u${key++}`} className="my-1 space-y-1.5">
        {bullets.map((b, i) => (
          <li
            key={i}
            className="leading-relaxed text-[var(--color-ink)]/90 pl-5 relative before:content-['▸'] before:absolute before:left-0 before:top-0 before:text-[var(--color-accent)] before:font-bold"
          >
            {renderInline(b, `u${key}-${i}`)}
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim()) {
      flushParagraph();
      flushBullets();
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      flushParagraph();
      flushBullets();
      const level = h[1].length;
      const content = h[2];
      const numbered = content.match(/^(\d+)\.\s+(.+)$/);
      if (numbered && level === 2) {
        blocks.push(
          <div
            key={`h${key++}`}
            className="flex items-baseline gap-2.5 mt-4 first:mt-0 pb-1 border-b border-[var(--color-rule)]"
          >
            <span className="shrink-0 inline-flex items-center justify-center size-5 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] text-[10.5px] font-bold tabular-nums leading-none translate-y-px">
              {numbered[1]}
            </span>
            <h3 className="text-[15px] font-semibold text-[var(--color-ink)] tracking-tight">
              {renderInline(numbered[2], `h${key}`)}
            </h3>
          </div>,
        );
        continue;
      }
      if (level === 2) {
        blocks.push(
          <h3
            key={`h${key++}`}
            className="text-[15px] font-semibold text-[var(--color-ink)] mt-4 first:mt-0 pb-1 border-b border-[var(--color-rule)] tracking-tight"
          >
            {renderInline(content, `h${key}`)}
          </h3>,
        );
        continue;
      }
      blocks.push(
        <h4
          key={`h${key++}`}
          className="text-[13.5px] font-semibold text-[var(--color-ink)] mt-3 first:mt-0 uppercase tracking-wide"
        >
          {renderInline(content, `h${key}`)}
        </h4>,
      );
      continue;
    }
    const b = line.match(/^\s*(?:[-*•])\s+(.+)$/);
    if (b) {
      flushParagraph();
      bullets.push(b[1]);
      continue;
    }
    flushBullets();
    buf.push(line);
  }
  flushParagraph();
  flushBullets();

  return <>{blocks}</>;
}
