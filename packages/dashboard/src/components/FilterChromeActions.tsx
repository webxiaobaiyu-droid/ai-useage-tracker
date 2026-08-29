import { useState, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowsRotateRight,
  Gear,
  LogoGithub,
  NodesRight,
} from '@gravity-ui/icons';
import { Button, Tooltip } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useInstallGuideUi } from '@/hooks/InstallGuideUiContext';
import { isCliBackend, triggerSync } from '@/lib/api';
import { GITHUB_REPO_URL } from '@/lib/downloads';
import {
  dispatchDataSynced,
  dispatchOpenSettings,
  shareCurrentPage,
} from '@/lib/shell-events';
import { cn } from '@/lib/utils';

function openGithubRepository(): void {
  const opened = window.open(GITHUB_REPO_URL, '_blank');
  if (opened) {
    opened.opener = null;
    return;
  }
  window.location.assign(GITHUB_REPO_URL);
}

/**
 * Filter-bar chrome: share / refresh / settings + theme toggle.
 * Public web shows share + theme; CLI also shows refresh / settings.
 */
export function FilterChromeActions() {
  const navigate = useNavigate();
  const cliBackend = isCliBackend();
  const installGuideUi = useInstallGuideUi();
  const [busy, setBusy] = useState(false);
  const refreshLabel = cliBackend ? '同步数据' : '刷新数据';
  const showDownloadEntry = !cliBackend;
  const hasUserData = installGuideUi?.hasUserData === true;

  const openDownloadPage = () => {
    void navigate({ to: '/download' });
  };

  const refreshData = async () => {
    setBusy(true);
    try {
      if (cliBackend) {
        await triggerSync();
        // Electron IPC already pushes DATA_SYNCED; a second dispatch double-reloads charts.
        if (
          typeof (window as { tud?: { onDataSynced?: unknown } }).tud
            ?.onDataSynced !== 'function'
        ) {
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
      {showDownloadEntry ? (
        hasUserData ? (
          <ChromeAction
            icon={<ArrowDownToLine className="size-4" />}
            label="下载客户端"
            onPress={openDownloadPage}
          />
        ) : (
          <button
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-[#1e80ff] px-2.5 text-[12px] font-medium text-white outline-none transition-colors hover:bg-[#1171ee] focus-visible:ring-2 focus-visible:ring-[#1e80ff]/40 disabled:pointer-events-none disabled:opacity-40 dark:bg-[#4b9cff] dark:hover:bg-[#3a8ff0]"
            onClick={openDownloadPage}
            type="button"
          >
            <ArrowDownToLine className="size-3.5" />
            下载客户端
          </button>
        )
      ) : null}
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
      {cliBackend ? (
        <>
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
        </>
      ) : null}
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