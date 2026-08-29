# @ai-usage-tracker/cli

本地优先的 AI Agent Token 用量看板：采集 Claude / Codex / Cursor 用量，启动本地面板。

## 安装

需要 Node.js >= 20。

```bash
npm i -g @ai-usage-tracker/cli
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
ai-usage status                 # 查看面板与同步状态
```

需要前台跑（当前终端占用、方便看日志）时再用：

```bash
ai-usage start                  # 或直接 ai-usage
# Ctrl+C 停止
```

## 命令

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
ai-usage service start
ai-usage start --port 8452
ai-usage sync --source=claude          # claude | codex | cursor | all
```

## 数据与同步

- 数据目录：`~/.ai-usage/`
- Claude / Codex：优先 Hook 触发 `ai-usage sync`；失败时回退定时轮询
- Cursor：轮询模式（无 Hook）

调试日志：`~/.ai-usage/logs/notify.log`、`~/.ai-usage/logs/sync.log`。

## License

MIT
