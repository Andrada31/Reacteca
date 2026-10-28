import { Suspense, use, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, FileCode2, FileX2 } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { IconButton } from '@/components/IconButton';
import { indicatorSpring } from '@/lib/motion';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { downloadText } from '@/lib/download';
import { loadSource, type ComponentEntry, type SourceFile } from '@/registry';
import { CodeBlock } from './CodeBlock';
import { InstallCommand } from './InstallCommand';

/** Every file concatenated, each headed by a comment with its name. */
function bundleFiles(files: SourceFile[]): string {
  return files
    .map((file) => `${file.language === 'css' ? `/* ${file.name} */` : `// ${file.name}`}\n${file.code}`)
    .join('\n\n');
}

export function CodePanel({ entry }: { entry: ComponentEntry }) {
  const hasInstall = entry.dependencies.length > 0 || entry.registryDependencies.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {hasInstall && <InstallCommand packages={entry.dependencies} components={entry.registryDependencies} />}
      <Suspense fallback={<CodeSkeleton />}>
        <SourceViewer slug={entry.slug} />
      </Suspense>
    </div>
  );
}

function SourceViewer({ slug }: { slug: string }) {
  const source = use(loadSource(slug));
  const files = source.usage ? [...source.files, source.usage] : source.files;
  const [activeName, setActiveName] = useState(files[0]?.name ?? '');
  const active = files.find((file) => file.name === activeName) ?? files[0];
  const indicatorId = `${useId()}-file`;

  if (!active) {
    return (
      <Empty className="rounded-[2rem] bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileX2 />
          </EmptyMedia>
          <EmptyTitle>No source files yet</EmptyTitle>
          <EmptyDescription>
            Add a <code>.tsx</code> file next to <code>meta.ts</code> and it will show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const isUsage = active === source.usage;

  return (
    <Tabs value={active.name} onValueChange={setActiveName} className="gap-0 rounded-[1.75rem] bg-card p-1.5">
      <div className="flex items-center justify-between gap-2 pr-0.5 pb-1.5">
        <TabsList
          aria-label="Source files"
          className="min-w-0 justify-start overflow-x-auto [scrollbar-width:none]"
        >
          {files.map((file) => {
            const usage = file === source.usage;
            return (
              <TabsTrigger
                key={file.name}
                value={file.name}
                className="isolate flex-none px-2.5 font-mono text-xs data-active:bg-transparent"
              >
                {file === active && (
                  <motion.span
                    layoutId={indicatorId}
                    transition={indicatorSpring}
                    className="absolute inset-0 -z-10 rounded-full bg-background"
                  />
                )}
                {usage ? <BookOpen /> : <FileCode2 />}
                {usage ? 'Usage' : file.name}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <div className="flex shrink-0 items-center gap-0.5">
          {source.files.length > 1 && !isUsage && (
            <CopyButton
              value={() => bundleFiles(source.files)}
              label="Copy all"
              showLabel
              className="hidden sm:inline-flex"
            />
          )}
          <IconButton label={`Download ${active.name}`} onClick={() => downloadText(active.name, active.code)}>
            <Download />
          </IconButton>
          <CopyButton value={active.code} label={`Copy ${active.name}`} />
        </div>
      </div>
      {files.map((file) => (
        <TabsContent key={file.name} value={file.name} className="overflow-hidden rounded-[1.375rem] bg-background [--code:var(--background)]">
          <CodeBlock bare code={file.code} language={file.language} showLineNumbers collapseAt={560} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function CodeSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-[1.75rem] bg-card p-6" aria-busy="true" aria-label="Loading source">
      {[72, 48, 64, 36, 80, 52, 40].map((width, index) => (
        <Skeleton key={index} className="h-2.5 rounded-full" style={{ width: `${width}%` }} />
      ))}
    </div>
  );
}
