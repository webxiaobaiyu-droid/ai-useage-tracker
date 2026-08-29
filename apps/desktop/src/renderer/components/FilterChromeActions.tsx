import { useState, type ReactNode } from 'react';
import {
  ArrowsRotateRight,
  Gear,
  LogoGithub,
  NodesRight,
} from '@gravity-ui/icons';
import { Button, Tooltip } from '@heroui/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { isCliBackend, triggerSync } from '@/lib/api';
import {
  dispatchDataSynced,
  dispatchOpenSettings,
  shareCurrentPage,
} from '@/lib/shell-events';
import { cn } from '@/lib/utils';

const GITHUB_REPO_URL = 'https://github.com/ai-usage-tracker/ai-usage-tracker';

function openGithubRepository(): void {
  void window.tud.openExternal(GITHUB_REPO_URL);
}

/** Filter-bar chrome: share / refresh / settings + theme toggle. */
export function FilterChromeActions() {
  const cliBackend = isCliBackend();
  const [busy, setBusy] = useState(false);
  const refreshLabel = cliBackend ? '同步数据' : '刷新数据';

  const refreshData = async () => {
    setBusy(true);
    try {
      if (cliBackend) {
        await triggerSync();
        // Electron IPC already pushes DATA_SYNCED; a second dispatch double-reloads charts.
        if (typeof window.tud?.onDataSynced !== 'function') {
          dispatchDataSynced();
        }
      } else {
        dispatchDataSynced();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <ChromeAction
        icon={<LogoGithub className="size-4" />}
        label="GitHub 仓库"
        onPress={openGithubRepository}
      />
      <ChromeAction
        icon={<NodesRight className="size-4" />}
        label="分享"
        onPress={() => {
          void shareCurrentPage();
        }}
      />
      <ChromeAction
        disabled={busy}
        icon={
          <ArrowsRotateRight
            className={cn('size-4', busy && 'animate-spin')}
          />
        }
        label={refreshLabel}
        onPress={() => {
          void refreshData();
        }}
      />
      <ChromeAction
        icon={<Gear className="size-4" />}
        label="设置"
        onPress={() => dispatchOpenSettings()}
      />
      <ThemeToggle />
    </div>
  );
}

function ChromeAction({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip closeDelay={80} delay={100}>
      <Button
        aria-label={label}
        className="size-8 min-h-8 min-w-8 shrink-0 p-0"
        isDisabled={disabled}
        isIconOnly
        onPress={onPress}
        size="sm"
        variant="tertiary"
      >
        {icon}
      </Button>
      <Tooltip.Content placement="bottom">
        <p>{label}</p>
      </Tooltip.Content>
    </Tooltip>
  );
}