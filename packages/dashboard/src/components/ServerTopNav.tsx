import { useState } from 'react';
import { ChevronDown } from '@gravity-ui/icons';
import { Link } from '@tanstack/react-router';
import { Button, Popover } from '@heroui/react';
import { cn } from '@/lib/utils';

type NavItem = { kind: 'internal'; to: '/dashboard' | '/pricing'; label: string };

const NAV_ITEMS: NavItem[] = [
  { kind: 'internal', to: '/dashboard', label: '用量' },
  { kind: 'internal', to: '/pricing', label: '模型价格' },
];

const navLinkClass = (active: boolean) =>
  cn(
    'inline-flex h-full items-center text-[15px] font-normal transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent',
    active
      ? 'text-[#1e80ff] dark:text-[#4b9cff]'
      : 'text-foreground/70 hover:text-foreground dark:text-foreground/65 dark:hover:text-foreground',
  );

const dropdownItemClass = (active: boolean) =>
  cn(
    'flex min-h-11 w-full items-center px-4 text-[15px] font-normal whitespace-nowrap',
    'transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent',
    active
      ? 'text-[#1e80ff] dark:text-[#4b9cff]'
      : 'text-[#515767] hover:text-foreground dark:text-foreground/65 dark:hover:text-foreground',
  );

interface ServerTopNavProps {
  pathname: string;
}

function isNavItemActive(item: NavItem, pathname: string) {
  return item.to === pathname;
}

function currentNavLabel(pathname: string) {
  const match = NAV_ITEMS.find((item) => isNavItemActive(item, pathname));
  return match?.label ?? '用量';
}

function NavItemLink({
  item,
  pathname,
  className,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  className: (active: boolean) => string;
  onNavigate?: () => void;
}) {
  const active = isNavItemActive(item, pathname);

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={className(active)}
      to={item.to}
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );
}

function MobileNavDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const currentLabel = currentNavLabel(pathname);

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Button
        aria-label={`当前栏目：${currentLabel}，展开导航`}
        className={cn(
          'h-11 min-h-11 min-w-11 gap-1 rounded-none border-0 bg-transparent px-1 py-0',
          'text-[15px] font-normal text-[#1e80ff] shadow-none',
          'hover:bg-transparent hover:text-[#1e80ff]',
          'data-[pressed=true]:bg-transparent data-[pressed=true]:text-[#1e80ff]',
          'dark:text-[#4b9cff] dark:hover:text-[#4b9cff]',
          'dark:data-[pressed=true]:text-[#4b9cff]',
        )}
        variant="ghost"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-3.5 shrink-0 opacity-80 transition-transform duration-200',
            'motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </Button>
      <Popover.Content
        className="min-w-28 overflow-hidden rounded-md border-0 bg-white p-0 text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:bg-[#181818] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
        placement="bottom start"
      >
        <Popover.Dialog className="p-0 outline-none">
          <Popover.Heading className="sr-only">站点导航</Popover.Heading>
          <nav aria-label="主导航" className="flex flex-col py-1">
            {NAV_ITEMS.map((item) => (
              <NavItemLink
                className={dropdownItemClass}
                item={item}
                key={item.to}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

/** Public server header. Kept separate from the CLI's floating navigation. */
export function ServerTopNav({ pathname }: ServerTopNavProps) {
  return (
    <header className="relative z-40 h-15 shrink-0 bg-white shadow-none dark:bg-[#181818]">
      <div className="mx-auto flex h-full w-full max-w-240 items-center gap-3 px-4 sm:gap-8 md:gap-12 md:px-8">
        <span className="shrink-0 text-[15px] font-semibold text-foreground">
          AI Usage Tracker
        </span>

        <div className="md:hidden">
          <MobileNavDropdown pathname={pathname} />
        </div>

        <nav
          aria-label="主导航"
          className="hidden h-full items-center gap-7 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavItemLink
              className={navLinkClass}
              item={item}
              key={item.to}
              pathname={pathname}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}