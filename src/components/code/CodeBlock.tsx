import { useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Highlight } from 'prism-react-renderer';
import { ChevronDown, ChevronUp, FileCode2 } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { prismTheme } from './prism-theme';

const prismLanguages: Record<string, string> = {
  tsx: 'tsx',
  ts: 'typescript',
  jsx: 'jsx',
  js: 'javascript',
  css: 'css',
  json: 'json',
  markdown: 'markdown',
};

interface CodeBlockProps {
  code: string;
  /** A CodeLanguage (tsx, ts, css, markdown, ...). Unknown values render as plain text. */
  language?: string;
  /** Header content: a filename or any node. Omit for a compact block with a floating copy button. */
  title?: ReactNode;
  /** Extra header actions, placed before the copy button. */
  actions?: ReactNode;
  showLineNumbers?: boolean;
  /** Soft-wrap long lines instead of scrolling horizontally. */
  wrap?: boolean;
  /** Collapse code taller than this many pixels behind a "Show all" toggle. */
  collapseAt?: number;
  copyLabel?: string;
  /** Extra attributes for the code body. */
  bodyProps?: HTMLAttributes<HTMLDivElement>;
  /** No frame or copy button, for embedding in a panel that has its own. */
  bare?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'plain',
  title,
  actions,
  showLineNumbers = false,
  wrap = false,
  collapseAt,
  copyLabel = 'Copy code',
  bodyProps,
  bare = false,
  className,
}: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  // Remember which code was expanded, so switching files starts collapsed again.
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const expanded = expandedCode === code;

  useLayoutEffect(() => {
    const pre = preRef.current;
    if (!pre || !collapseAt) return;
    // A little slack so we never collapse just to hide a couple of lines.
    const measure = () => setOverflowing(pre.scrollHeight > collapseAt + 80);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pre);
    return () => observer.disconnect();
  }, [code, collapseAt]);

  const collapsed = overflowing && !expanded;
  const hasHeader = title !== undefined || actions !== undefined;
  // With a header the block is a gray frame holding a white code panel; without, a plain tinted block.
  const framed = hasHeader && !bare;
  const lineCount = code.split('\n').length;

  return (
    <div
      className={cn(
        'relative min-w-0',
        framed ? 'rounded-[1.75rem] bg-card p-1.5' : 'overflow-hidden bg-code',
        !framed && !bare && 'rounded-2xl',
        className,
      )}
    >
      {hasHeader && (
        <div className="flex min-h-10 items-center justify-between gap-3 py-0.5 pr-0.5 pl-3">
          <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
            {typeof title === 'string' ? (
              <>
                <FileCode2 className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate text-foreground/90">{title}</span>
              </>
            ) : (
              title
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {actions}
            <CopyButton value={code} label={copyLabel} />
          </div>
        </div>
      )}

      <div className={cn(framed && 'overflow-hidden rounded-[1.375rem] bg-code [--code:var(--background)]')}>
      <div
        {...bodyProps}
        className={cn('relative', collapsed && 'overflow-hidden')}
        style={collapsed ? { maxHeight: collapseAt } : undefined}
      >
        <Highlight theme={prismTheme} code={code} language={prismLanguages[language] ?? 'plain'}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre
              ref={preRef}
              className="overflow-x-auto py-4 text-[13px] leading-[1.7] [tab-size:2] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              tabIndex={0}
              aria-label={typeof title === 'string' ? title : 'Code'}
            >
              <code className={cn('grid min-w-full', !wrap && 'w-max')}>
                {tokens.map((line, lineIndex) => (
                  <div
                    key={lineIndex}
                    {...getLineProps({ line, className: cn('flex min-h-[1.7em] pr-5', showLineNumbers ? 'pl-0' : 'pl-5') })}
                  >
                    {showLineNumbers && (
                      <span
                        className="sticky left-0 w-[3.6em] shrink-0 bg-code pr-[1.4em] text-right text-muted-foreground/50 select-none"
                        aria-hidden
                      >
                        {lineIndex + 1}
                      </span>
                    )}
                    <span className={wrap ? 'min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere]' : 'whitespace-pre'}>
                      {line.map((token, tokenIndex) => (
                        <span key={tokenIndex} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          )}
        </Highlight>
      </div>

      {overflowing && (
        <div className="flex justify-center p-2.5">
          <Button variant="secondary" size="sm" onClick={() => setExpandedCode(expanded ? null : code)}>
            {collapsed ? (
              <>
                Show all {lineCount} lines <ChevronDown />
              </>
            ) : (
              <>
                Collapse <ChevronUp />
              </>
            )}
          </Button>
        </div>
      )}
      </div>

      {!hasHeader && !bare && (
        <div className="absolute top-2 right-2 rounded-full bg-inherit">
          <CopyButton value={code} label={copyLabel} />
        </div>
      )}
    </div>
  );
}
