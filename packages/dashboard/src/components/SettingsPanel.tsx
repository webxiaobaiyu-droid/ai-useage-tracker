import { useEffect, useState } from 'react';
import {
  Button,
  Description,
  Input,
  Label,
  Modal,
  Surface,
  Tabs,
  TextField,
  Toast,
  ToastQueue,
} from '@heroui/react';
import {
  fetchConfig,
  getApiBearer,
  hasConfiguredApiBearer,
  isCliBackend,
  setApiBearer,
  type TudConfigView,
} from '@/lib/api';
import { AboutContent } from '@/components/AboutContent';
import { StatusBanner } from '@/components/StatusBanner';
import { type SettingsTabId } from '@/lib/shell-events';

const TAB_ITEMS: { id: SettingsTabId; label: string }[] = [
  { id: 'app', label: '应用' },
  { id: 'about', label: '关于' },
];

export function SettingsPanel({
  activeTab,
  onTabChange,
}: {
  activeTab?: SettingsTabId;
  onTabChange?: (tab: SettingsTabId) => void;
} = {}) {
  const cliMode = isCliBackend();
  const [toastQueue] = useState(
    () => new ToastQueue({ maxVisibleToasts: 1 }),
  );
  const [uncontrolledTab, setUncontrolledTab] = useState<SettingsTabId>('app');
  const tab = activeTab ?? uncontrolledTab;
  const setTab = onTabChange ?? setUncontrolledTab;

  // Sync / pet tabs were removed — fall back to the app tab.
  const resolvedTab: SettingsTabId =
    tab === 'sync' || tab === 'pet' ? 'app' : tab;

  return (
    <div className="w-full">
      <Toast.Provider placement="top end" queue={toastQueue} />
      <Tabs
        className="w-full text-center"
        selectedKey={resolvedTab}
        onSelectionChange={(key) => setTab(String(key) as SettingsTabId)}
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

        <Tabs.Panel className="h-[50vh] overflow-y-auto p-3 text-left" id="app">
          {resolvedTab === 'app' && (
            <div className="flex flex-col gap-4">
              {!cliMode && (
                <ServerAuthSettingsPanel
                  onLoggedOut={() =>
                    toastQueue.add({
                      title: '已退出登录',
                      variant: 'success',
                    })
                  }
                  onSaved={() =>
                    toastQueue.add({
                      description: '返回用量页即可拉取对应数据',
                      title: '已保存',
                      variant: 'success',
                    })
                  }
                />
              )}
              <AppSettingsPanel />
            </div>
          )}
        </Tabs.Panel>
        <Tabs.Panel
          className="h-[50vh] overflow-y-auto p-3 text-left"
          id="about"
        >
          {resolvedTab === 'about' && <AboutContent />}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

function AppSettingsPanel() {
  const [config, setConfig] = useState<TudConfigView | null>(null);
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

  if (loading) {
    return <p className="text-muted">加载配置…</p>;
  }

  if (error) {
    return <StatusBanner tone="error" title={error} />;
  }

  if (!config) {
    return (
      <p className="text-sm text-muted">
        当前为 Web 模式，设备信息仅在本机 CLI / 桌面端可见。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Surface className="rounded-xl p-4" variant="secondary">
        <h3 className="mb-3 text-sm font-medium text-foreground">设备信息</h3>
        <div className="flex flex-col gap-2 text-sm">
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
        </div>
      </Surface>
    </div>
  );
}

function readStoredApiBearer(): boolean {
  try {
    return Boolean(localStorage.getItem('tud.apiBearer')?.trim());
  } catch {
    return false;
  }
}

function ServerAuthSettingsPanel({
  onLoggedOut,
  onSaved,
}: {
  onLoggedOut: () => void;
  onSaved: () => void;
}) {
  const [token, setToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [hasStoredToken, setHasStoredToken] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHasToken(hasConfiguredApiBearer());
    setHasStoredToken(readStoredApiBearer());
    setToken('');
  }, []);

  const refreshAuthState = () => {
    setHasToken(hasConfiguredApiBearer());
    setHasStoredToken(readStoredApiBearer());
    setToken('');
  };

  const onSave = () => {
    setSaving(true);
    setError(null);
    try {
      setApiBearer(token.trim() || null);
      refreshAuthState();
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const onConfirmLogout = () => {
    setError(null);
    try {
      setApiBearer(null);
      refreshAuthState();
      setConfirmLogoutOpen(false);
      onLoggedOut();
    } catch (e) {
      setError(e instanceof Error ? e.message : '退出失败');
      setConfirmLogoutOpen(false);
    }
  };

  const envFallback = Boolean(import.meta.env.VITE_API_BEARER?.trim());
  const showEnvHint = envFallback && !hasStoredToken;

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      {error && <StatusBanner tone="error" title={error} />}
      <p className="text-sm text-muted">
        Web 侧由本机 CLI 上报。业务请求通过 header 标识账号，页面会先调
        `tud-session`，成功后再拉用量。
      </p>
      <TextField fullWidth name="bearerToken" type="password">
        <Label>用户 ID</Label>
        <Input
          fullWidth
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={hasToken ? '已配置（留空并保存可清除）' : '用户 ID'}
        />
        <Description>
          {showEnvHint
            ? `当前使用开发环境默认身份（${maskToken(getApiBearer() ?? '')}）。保存后将覆盖。`
            : '保存后页面将按此身份拉取对应账号数据。'}
        </Description>
      </TextField>

      {!hasToken && !token.trim() && !envFallback && (
        <StatusBanner
          tone="info"
          title="未配置用户 ID"
          description="个人用量接口暂时无法定位账号。"
        />
      )}

      <div className="mt-auto flex justify-end gap-2">
        {hasStoredToken && (
          <Button
            isDisabled={saving}
            onPress={() => setConfirmLogoutOpen(true)}
            variant="danger"
          >
            退出登录
          </Button>
        )}
        <Button isDisabled={saving} onPress={onSave} variant="primary">
          {saving ? '保存中…' : '保存设置'}
        </Button>
      </div>

      <Modal.Backdrop
        isOpen={confirmLogoutOpen}
        onOpenChange={setConfirmLogoutOpen}
        variant="blur"
      >
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.CloseTrigger aria-label="关闭" />
            <Modal.Header>
              <Modal.Heading>退出登录</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="text-sm text-muted">
              确认清除本机保存的用户 ID？
            </Modal.Body>
            <Modal.Footer className="gap-2">
              <Button slot="close" variant="tertiary">
                取消
              </Button>
              <Button onPress={onConfirmLogout} variant="danger">
                确认退出
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}

function maskToken(token: string): string {
  if (token.length <= 8) return '***';
  return `${token.slice(0, 8)}…`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className="break-all text-right font-mono text-xs">{value}</span>
    </div>
  );
}