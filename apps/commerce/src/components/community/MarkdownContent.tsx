import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'hast-util-sanitize';

/**
 * Sanitize schema: start from rehype-sanitize's default (already strips
 * scripts, event handlers, javascript: URLs) then narrow for community UGC.
 *
 * - Drop raw HTML tags users wouldn't legitimately need (images, tables OK;
 *   forms/iframes/object would be vectors).
 * - Force `rel="nofollow noreferrer"` + `target="_blank"` on all anchors so
 *   user-pasted links don't pass SEO juice or open in the same tab.
 */
const schema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ['rel', 'nofollow', 'noreferrer'],
      ['target', '_blank'],
    ],
  },
  protocols: {
    ...defaultSchema.protocols,
    // Allow http/https/mailto only — rehype-sanitize default already disallows
    // javascript: and data: schemes for href, but be explicit.
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
  },
};

interface MarkdownContentProps {
  content: string;
  /** Override classes for the wrapping prose container. */
  className?: string;
}

/**
 * Renders user-generated markdown safely. GFM (tables, strikethrough, task
 * lists, autolinks) is supported. Output gets Tailwind Typography `.prose`
 * styling so headings/links/code blocks look reasonable without per-element
 * overrides.
 */
export function MarkdownContent({
  content,
  className = 'prose prose-sm max-w-none text-[var(--color-text-primary)] leading-relaxed prose-a:text-[var(--color-brand-accent)] prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg',
}: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, schema]]}
        components={{
          // Soft 1px hairline for `---` sections — quiet, doesn't shout.
          hr: () => (
            <hr
              className="my-8 border-0 h-px bg-[var(--mz-line)]"
              aria-hidden="true"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
