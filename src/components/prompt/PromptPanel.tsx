import { useId, useMemo, type ReactNode } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';
import { CopyButton } from '@/components/CopyButton';
import { SegmentedControl, type SegmentOption } from '@/components/SegmentedControl';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useComponentSource } from '@/hooks/useComponentSource';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { storageKeys } from '@/lib/storage';
import {
  buildPrompt,
  defaultPromptOptions,
  estimateTokens,
  type ComponentEntry,
  type PromptFramework,
  type PromptLanguage,
  type PromptMode,
  type PromptOptions,
  type PromptStyling,
} from '@/registry';

const modeOptions: SegmentOption<PromptMode>[] = [
  { value: 'source', label: 'With source' },
  { value: 'spec', label: 'Spec only' },
];

const modeHints: Record<PromptMode, string> = {
  source: 'Embeds the full source so the AI reproduces the component faithfully.',
  spec: 'Describes the component and lets the AI write it from scratch. Fewer tokens.',
};

const languageOptions: SegmentOption<PromptLanguage>[] = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
];

const frameworkOptions: SegmentOption<PromptFramework>[] = [
  { value: 'react', label: 'React' },
  { value: 'nextjs', label: 'Next.js' },
];

const stylingOptions: Array<{ value: PromptStyling; label: string }> = [
  { value: 'original', label: 'Keep original styling' },
  { value: 'tailwind', label: 'Tailwind CSS' },
  { value: 'css-modules', label: 'CSS Modules' },
];

const tokenFormatter = new Intl.NumberFormat('en');

export function PromptPanel({ entry }: { entry: ComponentEntry }) {
  const [stored, setStored] = useLocalStorage<Partial<PromptOptions>>(storageKeys.promptOptions, defaultPromptOptions);
  // Merge over defaults so options added later still get a value.
  const options = useMemo<PromptOptions>(() => ({ ...defaultPromptOptions, ...stored }), [stored]);
  const setOption = <K extends keyof PromptOptions>(key: K, value: PromptOptions[K]) =>
    setStored({ ...options, [key]: value });

  const wantsSource = options.mode === 'source' && entry.sourceFiles.length > 0;
  const { status, source } = useComponentSource(entry.slug, wantsSource);
  const loading = wantsSource && status === 'loading';

  const prompt = useMemo(() => buildPrompt(entry, source, options), [entry, source, options]);
  const tokens = tokenFormatter.format(estimateTokens(prompt));
  const stylingId = useId();

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_288px]">
      <div className="min-w-0">
        {loading ? (
          <div className="flex flex-col gap-3 rounded-[1.75rem] bg-card p-6" aria-busy="true" aria-label="Building prompt">
            {[60, 90, 75, 40, 85, 55].map((width, index) => (
              <Skeleton key={index} className="h-2.5 rounded-full" style={{ width: `${width}%` }} />
            ))}
          </div>
        ) : (
          <CodeBlock
            code={prompt}
            language="markdown"
            wrap
            collapseAt={620}
            copyLabel="Copy prompt"
            title={
              <span className="flex min-w-0 items-center gap-2">
                <Sparkles className="size-3.5 shrink-0 text-primary-strong" aria-hidden />
                <span className="truncate text-foreground/90">{entry.slug}.prompt.md</span>
                <Badge variant="outline" className="bg-background font-sans font-normal text-muted-foreground">
                  ~{tokens} tokens
                </Badge>
              </span>
            }
          />
        )}
      </div>

      <aside
        aria-label="Prompt options"
        className="grid gap-5 rounded-[1.75rem] bg-card p-5 max-xl:order-first sm:max-xl:grid-cols-2 xl:sticky xl:top-20"
      >
        <div className="flex items-center gap-2 text-sm font-semibold sm:max-xl:col-span-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden />
          Customize prompt
        </div>

        <Field label="Content" hint={modeHints[options.mode]}>
          <SegmentedControl
            label="Content"
            fullWidth
            value={options.mode}
            options={modeOptions}
            onChange={(value) => setOption('mode', value)}
          />
        </Field>
        <Field label="Language">
          <SegmentedControl
            label="Language"
            fullWidth
            value={options.language}
            options={languageOptions}
            onChange={(value) => setOption('language', value)}
          />
        </Field>
        <Field label="Framework">
          <SegmentedControl
            label="Framework"
            fullWidth
            value={options.framework}
            options={frameworkOptions}
            onChange={(value) => setOption('framework', value)}
          />
        </Field>
        <Field label="Styling" htmlFor={stylingId}>
          <Select value={options.styling} onValueChange={(value) => setOption('styling', value as PromptStyling)}>
            <SelectTrigger id={stylingId} size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stylingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex flex-col gap-2.5 pt-2 sm:max-xl:col-span-2">
          <CopyButton
            value={prompt}
            label="Copy prompt"
            copiedLabel="Prompt copied!"
            showLabel
            variant="default"
            size="lg"
            className="w-full"
          />
          <p className="text-center text-xs text-muted-foreground">
            Paste it into Claude, ChatGPT, Cursor, v0 or any AI coding assistant.
          </p>
        </div>
      </aside>
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}

function Field({ label, hint, htmlFor, children }: FieldProps) {
  const labelClass = 'text-xs font-medium text-muted-foreground';
  return (
    <div className="flex flex-col gap-2">
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
        </label>
      ) : (
        <span className={labelClass}>{label}</span>
      )}
      {children}
      {hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
