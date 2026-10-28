import { Terminal } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { storageKeys } from '@/lib/storage';

const commands = {
  npm: { install: 'npm install', shadcn: 'npx shadcn@latest add' },
  pnpm: { install: 'pnpm add', shadcn: 'pnpm dlx shadcn@latest add' },
  yarn: { install: 'yarn add', shadcn: 'yarn shadcn@latest add' },
  bun: { install: 'bun add', shadcn: 'bunx --bun shadcn@latest add' },
} as const;

type PackageManager = keyof typeof commands;

const managerOptions = (Object.keys(commands) as PackageManager[]).map((value) => ({ value, label: value }));

interface InstallCommandProps {
  /** npm packages. */
  packages: string[];
  /** shadcn/ui components. */
  components: string[];
}

export function InstallCommand({ packages, components }: InstallCommandProps) {
  const [stored, setManager] = useLocalStorage<PackageManager>(storageKeys.packageManager, 'npm');
  const manager = stored in commands ? stored : 'npm';
  const lines = [
    components.length > 0 && { label: 'shadcn/ui', command: `${commands[manager].shadcn} ${components.join(' ')}` },
    packages.length > 0 && { label: 'packages', command: `${commands[manager].install} ${packages.join(' ')}` },
  ].filter((line) => line !== false);

  return (
    <div className="rounded-[1.75rem] bg-card p-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5 pr-0.5 pb-2 pl-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <Terminal className="size-4 text-muted-foreground" aria-hidden />
          Installation
        </span>
        <SegmentedControl label="Package manager" value={manager} options={managerOptions} onChange={setManager} />
      </div>
      <div className="flex flex-col rounded-[1.375rem] bg-background py-1.5">
        {lines.map((line) => (
          <div key={line.label} className="flex items-center gap-3 py-2 pr-2 pl-4 font-mono text-[13px]">
            <span className="text-muted-foreground/60 select-none" aria-hidden>
              $
            </span>
            <code className="min-w-0 flex-1 overflow-x-auto bg-transparent p-0 text-[13px] whitespace-nowrap [scrollbar-width:none]">
              {line.command}
            </code>
            <span className="hidden text-xs text-muted-foreground sm:inline">{line.label}</span>
            <CopyButton value={line.command} label="Copy command" />
          </div>
        ))}
      </div>
    </div>
  );
}
