import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface NotFoundPageProps {
  title?: string;
  description?: string;
}

export function NotFoundPage({
  title = 'Page not found',
  description = "The page you're looking for doesn't exist or has moved.",
}: NotFoundPageProps) {
  useDocumentTitle(title);

  return (
    <Empty className="py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-14 bg-primary/15 text-primary-strong">
          <Compass className="size-7!" />
        </EmptyMedia>
        <p className="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground">404</p>
        <EmptyTitle className="text-3xl font-semibold tracking-tight">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button asChild>
          <Link to="/">
            <ArrowLeft /> Back home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/components">Browse components</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
