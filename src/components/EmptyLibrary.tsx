import { Link } from 'react-router-dom';
import { ArrowRight, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { CodeBlock } from './code/CodeBlock';

export const scaffoldCommand = 'npm run new -- "Pill Button" --category buttons';

/** Shown wherever components would be listed while the library has none. */
export function EmptyLibrary() {
  return (
    <Empty className="rounded-[2rem] bg-card py-16">
      <EmptyHeader className="max-w-md">
        <EmptyMedia variant="icon" className="size-14 rounded-2xl bg-background text-foreground">
          <Boxes />
        </EmptyMedia>
        <EmptyTitle className="text-2xl font-semibold tracking-tight">Your library is empty</EmptyTitle>
        <EmptyDescription>
          Components you add to <code>src/library</code> show up here automatically, each with a live preview, its
          source code and an AI-ready prompt.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-md">
        <CodeBlock code={scaffoldCommand} language="bash" copyLabel="Copy command" className="w-full text-left [--code:var(--background)] [&_pre]:pr-12" />
        <Button variant="outline" asChild>
          <Link to="/getting-started#add-a-component">
            Read the guide <ArrowRight />
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
