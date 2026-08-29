import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Description,
  Label,
  ListBox,
  NumberField,
  ProgressBar,
  Select,
  Slider,
  Tabs,
  Toast,
  ToastQueue,
} from '@heroui/react';
import type { AutoUpdateState } from '../../shared/auto-update';
import {
  fetchConfig,
  isCliBackend,
  type TudConfigView,
} from '@/lib/api';
import { DESKTOP_PETS } from '@/pets';
import { AboutContent } from '@/components/AboutContent';
import { StatusBanner } from '@/components/StatusBanner';
import {
  OPEN_SETTINGS_EVENT,
  type OpenSettingsDetail,
  type SettingsTabId,
} from '@/lib/shell-events';

type DesktopSettingsTabId = SettingsTabId;

const TAB_ITEMS: { id: DesktopSettingsTabId; label: string }[] = [
  { id: 'pet', label: '桌面宠物' },
  { id: 'app', label: '应用' },
  { id: 'about', label: '关于' },
];

export function SettingsPanel({
  activeTab,
  onTabChange,
}: {
  activeTab?: DesktopSettingsTabId;
  onTabChange?: (tab: DesktopSettingsTabId) => void;
} = {}) {
  const [toastQueue] = useState(
    () => new ToastQueue({ maxVisibleToasts: 1 }),
  );
  const [uncontrolledTab, setUncontrolledTab] =
    useState<DesktopSettingsTabId>('pet');
  const tab = activeTab ?? uncontrolledTab;
  const setTab = onTabChange ?? setUncontrolledTab;

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenSettingsDetail>).detail;
      if (detail?.tab && detail.tab !== 'sync') {
        setTab(detail.tab);
      }
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
  }, [setTab]);

  return (
    <div className="w-full">
      <Toast.Provider placement="top end" queue={toastQueue} />
      <Tabs
        className="w-full text-center"
        selectedKey={tab}
        onSelectionChange={(key) => setTab(String(key) as DesktopSettingsTabId)}
      >
        <Tabs.ListContainer className="m-3 mr-14 w-fit">
          <Tabs.List
            aria-label="设置分类"
            className="w-fit *:h-6 *:w-fit *:px-3 *:text-sm *:font-normal *:data-[selected=true]:text-accent-foreground"
          >
            {TAB_ITEMS.map((item) => (
              <Tabs.Tab id={item.id} key={item.id}>
                <span className="text-xs font-normal">{item.label}</span>
                <Tabs.Indicator className="bg-accent" />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel className="h-[50vh] overflow-hidden p-4 text-left" id="pet">
          {tab === 'pet' && <DesktopPetSettings />}
        </Tabs.Panel>
        <Tabs.Panel className="h-[50vh] overflow-hidden p-4 text-left" id="app">
          {tab === 'app' && <AppSettingsPanel />}
        </Tabs.Panel>
        <Tabs.Panel className="h-[50vh] overflow-hidden p-4 text-left" id="about">
          {tab === 'about' && (
            <div className="h-full overflow-y-auto pr-1">
              <AboutContent />
            </div>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

function DesktopPetSettings() {
  const [enabled, setEnabled] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('hawking');
  const [scale, setScale] = useState(50);
  const [frameIntervalMs, setFrameIntervalMs] = useState(180);
  const [autoMoveEnabled, setAutoMoveEnabled] = useState(true);
  const [autoMoveIntervalMinutes, setAutoMoveIntervalMinutes] = useState(2);
  const saveTimer = useRef<number | null>(null);
  const pendingPreferenceChanges = useRef<{
    scale?: number;
    frameIntervalMs?: number;
    autoMoveEnabled?: boolean;
    autoMoveIntervalMinutes?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void window.tud
      .getDesktopPet()
      .then((pref) => {
        if (!cancelled) {
          setEnabled(pref.enabled);
          setSelectedPetId(pref.selectedPetId);
          setScale(Math.round(pref.scale * 100));
          setFrameIntervalMs(pref.frameIntervalMs);
          setAutoMoveEnabled(pref.autoMoveEnabled);
          setAutoMoveIntervalMinutes(pref.autoMoveIntervalMinutes);
        }
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(
            reason instanceof Error ? reason.message : '加载桌面宠物设置失败',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onChange = async (next: boolean) => {
    const previous = enabled;
    setEnabled(next);
    setError(null);
    try {
      await window.tud.setDesktopPetEnabled(next);
    } catch (reason) {
      setEnabled(previous);
      setError(
        reason instanceof Error ? reason.message : '更新桌面宠物设置失败',
      );
    }
  };

  const onSelectedPetChange = async (value: string | number | null) => {
    if (value === null) return;
    const next = String(value);
    if (!DESKTOP_PETS.some((pet) => pet.id === next)) return;
    const previous = selectedPetId;
    setSelectedPetId(next);
    setError(null);
    try {
      await window.tud.setSelectedDesktopPet(next);
    } catch (reason) {
      setSelectedPetId(previous);
      setError(
        reason instanceof Error ? reason.message : '切换桌面宠物失败',
      );
    }
  };

  const savePetPreferences = async (changes: {
    scale?: number;
    frameIntervalMs?: number;
    autoMoveEnabled?: boolean;
    autoMoveIntervalMinutes?: number;
  }) => {
    try {
      const saved = await window.tud.setDesktopPetPreferences(changes);
      setScale(Math.round(saved.scale * 100));
      setFrameIntervalMs(saved.frameIntervalMs);
      setAutoMoveEnabled(saved.autoMoveEnabled);
      setAutoMoveIntervalMinutes(saved.autoMoveIntervalMinutes);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : '更新桌面宠物设置失败',
      );
    }
  };

  const schedulePetPreferenceSave = (changes: {
    scale?: number;
    frameIntervalMs?: number;
    autoMoveEnabled?: boolean;
    autoMoveIntervalMinutes?: number;
  }) => {
    pendingPreferenceChanges.current = {
      ...pendingPreferenceChanges.current,
      ...changes,
    };
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null;
      const pending = pendingPreferenceChanges.current;
      pendingPreferenceChanges.current = {};
      void savePetPreferences(pending);
    }, 80);
  };

  useEffect(
    () => () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    },
    [],
  );

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {error && <StatusBanner tone="error" title={error} />}
      <div className="min-h-0 flex-1 overflow-hidden">
        <p className="mb-3 text-sm text-muted">
          显示悬浮宠物；拖动它可在桌面上移动。
        </p>
        <Checkbox
          id="desktop-pet-enabled"
          isDisabled={loading}
          isSelected={enabled}
          onChange={(checked) => {
            void onChange(checked);
          }}
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            显示桌面宠物
          </Checkbox.Content>
        </Checkbox>
        <div className="mt-5 flex flex-col gap-5">
          <Select
            aria-label="选择桌面宠物"
            isDisabled={loading}
            value={selectedPetId}
            variant="secondary"
            onChange={onSelectedPetChange}
          >
            <Label>宠物形象</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox aria-label="桌面宠物列表">
                {DESKTOP_PETS.map((pet) => (
                  <ListBox.Item
                    id={pet.id}
                    key={pet.id}
                    textValue={pet.displayName}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span>{pet.displayName}</span>
                      <span className="text-xs text-muted">
                        {pet.description}
                      </span>
                    </div>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <Slider
            isDisabled={loading}
            maxValue={75}
            minValue={35}
            onChange={(value) => {
              const next = Array.isArray(value) ? (value[0] ?? scale) : value;
              setScale(next);
              schedulePetPreferenceSave({ scale: next / 100 });
            }}
            step={5}
            value={scale}
          >
            <Label>宠物大小</Label>
            <Slider.Output>{`${scale}%`}</Slider.Output>
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
          </Slider>
          <Checkbox
            id="desktop-pet-auto-move-enabled"
            isDisabled={loading}
            isSelected={autoMoveEnabled}
            onChange={(checked) => {
              setAutoMoveEnabled(checked);
              void savePetPreferences({ autoMoveEnabled: checked });
            }}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              自动跑动
            </Checkbox.Content>
          </Checkbox>
          <NumberField
            isDisabled={loading || !autoMoveEnabled}
            maxValue={120}
            minValue={1}
            onChange={(value) => {
              if (!Number.isFinite(value)) return;
              const next = Math.min(120, Math.max(1, Math.round(value)));
              setAutoMoveIntervalMinutes(next);
              schedulePetPreferenceSave({ autoMoveIntervalMinutes: next });
            }}
            step={1}
            value={autoMoveIntervalMinutes}
            variant="secondary"
          >
            <Label>跑动间隔</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
            <Description>宠物空闲 {autoMoveIntervalMinutes} 分钟后，会在当前屏幕内随机自然跑动。</Description>
          </NumberField>
          <Slider
            isDisabled={loading}
            maxValue={320}
            minValue={120}
            onChange={(value) => {
              const next = Array.isArray(value)
                ? (value[0] ?? frameIntervalMs)
                : value;
              setFrameIntervalMs(next);
              schedulePetPreferenceSave({ frameIntervalMs: next });
            }}
            step={10}
            value={frameIntervalMs}
          >
            <Label>动作速度</Label>
            <Slider.Output>{`${frameIntervalMs} ms / 帧`}</Slider.Output>
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
          </Slider>
        </div>
      </div>
    </div>
  );
}


function AppSettingsPanel() {
  const cliMode = isCliBackend();
  const [config, setConfig] = useState<TudConfigView | null>(null);
  const [openAtLogin, setOpenAtLogin] = useState(true);
  const [autostartLoading, setAutostartLoading] = useState(true);
  const [autostartError, setAutostartError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchConfig()
      .then((data) => {
        if (!cancelled) {
          setConfig(data);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '加载配置失败');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAutostartLoading(true);
    void window.tud
      .getOpenAtLogin()
      .then((value) => {
        if (!cancelled) {
          setOpenAtLogin(value);
          setAutostartError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setAutostartError(
            e instanceof Error ? e.message : '加载开机自启设置失败',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setAutostartLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onOpenAtLoginChange = async (next: boolean) => {
    const prev = openAtLogin;
    setOpenAtLogin(next);
    setAutostartError(null);
    try {
      await window.tud.setOpenAtLogin(next);
    } catch (e) {
      setOpenAtLogin(prev);
      setAutostartError(
        e instanceof Error ? e.message : '更新开机自启失败',
      );
    }
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto pr-1">
      {error && <StatusBanner tone="error" title={error} />}
      {autostartError && (
        <StatusBanner tone="error" title={autostartError} />
      )}

      {cliMode && (
        <div>
          <p className="mb-3 text-sm text-muted">
            开机后在托盘后台启动，可从菜单栏图标打开主窗口。
          </p>
          <Checkbox
            id="desktop-open-at-login"
            isDisabled={autostartLoading}
            isSelected={openAtLogin}
            onChange={(checked) => {
              void onOpenAtLoginChange(checked);
            }}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              开机时自动启动
            </Checkbox.Content>
          </Checkbox>
        </div>
      )}

      <AutoUpdateSettings />

      {!loading && config && (
        <Card variant="tertiary" className="rounded-xl shadow-none">
          <Card.Header>
            <Card.Title>设备信息</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-2 text-sm">
            <InfoRow label="设备 ID" value={config.deviceId} />
            <InfoRow
              label="上报起点"
              value={config.statsSince.slice(0, 19).replace('T', ' ')}
            />
            <InfoRow
              label="上次同步"
              value={
                config.lastSyncAt
                  ? new Date(config.lastSyncAt).toLocaleString()
                  : '从未'
              }
            />
            <InfoRow
              label="上次上报"
              value={
                config.lastUploadAt
                  ? new Date(config.lastUploadAt).toLocaleString()
                  : '从未'
              }
            />
          </Card.Content>
        </Card>
      )}
    </div>
  );
}

function AutoUpdateSettings() {
  const [state, setState] = useState<AutoUpdateState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = window.tud.onAutoUpdateStateChanged((next) => {
      if (!cancelled) {
        setState(next);
        if (next.status !== 'error') setActionError(null);
      }
    });
    void window.tud
      .getAutoUpdateState()
      .then((next) => {
        if (!cancelled) setState(next);
      })
      .catch((reason) => {
        if (!cancelled) {
          setActionError(
            reason instanceof Error ? reason.message : '读取更新状态失败',
          );
        }
      });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const check = async () => {
    setActionError(null);
    try {
      setState(await window.tud.checkForUpdates());
    } catch (reason) {
      setActionError(
        reason instanceof Error ? reason.message : '检查更新失败',
      );
    }
  };

  const status = state?.status ?? 'idle';
  const busy =
    status === 'checking' ||
    status === 'available' ||
    status === 'downloading' ||
    status === 'installing';
  const message = updateStatusMessage(state);
  const error = actionError ?? (status === 'error' ? state?.message : null);

  return (
    <Card className="rounded-xl shadow-none" variant="tertiary">
      <Card.Header>
        <Card.Title>应用更新</Card.Title>
        <Card.Description>
          自动检查、下载并重启安装新版本
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <InfoRow
          label="当前版本"
          value={`v${state?.currentVersion ?? '—'}`}
        />

        {error && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>更新失败</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        {(status === 'available' || status === 'downloading') && (
          <ProgressBar
            aria-label="更新下载进度"
            isIndeterminate={state?.percent == null}
            size="sm"
            value={state?.percent ?? 0}
          >
            <Label>下载 v{state?.version}</Label>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted">{message}</p>
          {status !== 'installing' && (
            <Button
              isDisabled={status === 'unsupported' || busy}
              isPending={status === 'checking'}
              onPress={() => {
                void check();
              }}
              size="sm"
              variant="outline"
            >
              检查更新
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

function updateStatusMessage(state: AutoUpdateState | null): string {
  if (!state) return '正在读取更新状态…';
  switch (state.status) {
    case 'unsupported':
      return state.message ?? '开发环境不支持自动更新';
    case 'checking':
      return '正在检查新版本…';
    case 'available':
      return `发现 v${state.version ?? ''}，准备下载…`;
    case 'downloading':
      return `正在下载 v${state.version ?? ''}`;
    case 'installing':
      return `v${state.version ?? ''} 已下载，正在重启并安装…`;
    case 'not-available':
      return '当前已是最新版本';
    case 'error':
      return '未能完成更新检查，可稍后重试';
    default:
      return '应用启动后会自动检查更新';
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className="break-all text-right font-mono text-xs">{value}</span>
    </div>
  );
}
