import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PropDoc } from '@/registry';

interface PropsTableProps {
  props: PropDoc[];
  /** Header of the first column. */
  nameLabel?: string;
}

export function PropsTable({ props, nameLabel = 'Prop' }: PropsTableProps) {
  return (
    <div className="rounded-[1.75rem] bg-card p-1.5">
      <div className="overflow-hidden rounded-[1.375rem] bg-background">
      <Table>
        <TableHeader className="[&_th]:font-normal [&_th]:text-muted-foreground">
          <TableRow>
            <TableHead className="px-4">{nameLabel}</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="px-4">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map((prop) => (
            <TableRow key={prop.name} className="hover:bg-transparent even:bg-card even:hover:bg-card">
              <TableCell className="px-4 align-top">
                <code className="bg-primary/15 text-primary-strong">
                  {prop.name}
                  {prop.required && (
                    <span className="ml-0.5 text-destructive" title="Required">
                      *
                    </span>
                  )}
                </code>
              </TableCell>
              <TableCell className="align-top">
                <code>{prop.type}</code>
              </TableCell>
              <TableCell className="align-top">
                {prop.default ? <code>{prop.default}</code> : <span className="text-muted-foreground">–</span>}
              </TableCell>
              <TableCell className="min-w-56 px-4 align-top whitespace-normal text-muted-foreground">
                {prop.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
