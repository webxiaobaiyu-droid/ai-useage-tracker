# CLI 使用说明

需要 Node.js >= 20。

## 安装

```bash
npm i -g @ai-usage-tracker/cli
```

国内网络较慢时，可使用镜像源：

```bash
npm i -g @ai-usage-tracker/cli --registry=https://registry.npmmirror.com/
```

也可免安装直接用 `npx`：

```bash
# 后台常驻（推荐，支持开机自启）
npx @ai-usage-tracker/cli service start

# 前台运行（当前终端占用，方便看日志，Ctrl+C 停止）
npx @ai-usage-tracker/cli start

# 面板: http://127.0.0.1:8452
```

## 快速开始

推荐用后台服务启动（常驻，支持开机自启，macOS / Windows）：

```bash
ai-usage service start
# 面板: http://127.0.0.1:8452
```

首次启动会写入数据目录 `~/.ai-usage/`，尝试注册 Claude / Codex Hook，并同步本地用量。

常用管理：

```bash
ai-usage service status
ai-usage service stop
ai-usage status
```

需要前台运行（当前终端占用、方便看日志）时再用：

```bash
ai-usage start
# Ctrl+C 停止
```

## 命令一览

| 命令 | 说明 |
|------|------|
| `ai-usage service <action>` | **推荐** 后台服务与开机自启；`action`: `start` \| `stop` \| `status` |
| `ai-usage` / `ai-usage start` | 前台启动本地面板与同步 |
| `ai-usage stop` | 停止当前进程内的前台服务 |
| `ai-usage status` | 查看 CLI / 面板当前状态 |
| `ai-usage sync` | 手动同步本地用量数据 |
| `ai-usage help` | 显示帮助 |

## 常用选项

```bash
ai-usage start --port 8452
ai-usage sync --source=claude          # claude | codex | cursor | all
```

## 数据与同步

- 数据目录：`~/.ai-usage/`
- Claude / Codex：优先 Hook 触发 `ai-usage sync`；失败时回退定时轮询
- Cursor：轮询模式（无 Hook）

调试日志：`~/.ai-usage/logs/notify.log`、`~/.ai-usage/logs/sync.log`。
