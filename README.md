<p align="center">
  <img src="./assets/icon.png" alt="AI Usage Tracker logo" width="200">
</p>

<p align="center">
  Token 用量明细追踪工具，本地记录、本地看板，<br>追踪 Claude / Codex / Cursor 等 AI 工具的用量。
</p>

<p align="center">
  <a href="https://github.com/ai-usage-tracker/ai-usage-tracker">
    <img src="https://img.shields.io/github/stars/ai-usage-tracker/ai-usage-tracker?style=flat-square" alt="stars">
  </a>
  <a href="https://github.com/ai-usage-tracker/ai-usage-tracker/issues">
    <img src="https://img.shields.io/github/issues/ai-usage-tracker/ai-usage-tracker?style=flat-square" alt="issues">
  </a>
  <a href="https://github.com/ai-usage-tracker/ai-usage-tracker/releases">
    <img src="https://img.shields.io/github/downloads/ai-usage-tracker/ai-usage-tracker/total?style=flat-square" alt="downloads">
  </a>
  <a href="https://github.com/ai-usage-tracker/ai-usage-tracker/releases/latest">
    <img src="https://img.shields.io/github/v/release/ai-usage-tracker/ai-usage-tracker?include_prereleases&style=flat-square" alt="release">
  </a>
  <a href="https://github.com/ai-usage-tracker/ai-usage-tracker/commits/main">
    <img src="https://img.shields.io/github/last-commit/ai-usage-tracker/ai-usage-tracker?style=flat-square" alt="last-commit">
  </a>
</p>

<p align="center">
  <a href="https://github.com/ai-usage-tracker/ai-usage-tracker/releases">下载安装包</a>
  ·
  <a href="./FAQ.md">常见问题</a>
  ·
  <a href="#-用户隐私协议">用户隐私协议</a>
</p>

## 🖥️ 客户端使用

AI Usage Tracker 提供 macOS / Windows 桌面客户端，安装即用，无需额外配置。

### 下载安装

前往 [Releases](https://github.com/ai-usage-tracker/ai-usage-tracker/releases) 页面下载对应系统的安装包（macOS 按芯片选 `.dmg`，Windows 选 `.exe`），安装即用。

> 💡 macOS 提示「已损坏」？在终端执行 `sudo xattr -dr com.apple.quarantine` 后把应用拖入终端窗口即可。

### 首次启动

1. 打开 **AI Usage Tracker** 应用
2. 首次运行会自动尝试注册 Claude / Codex Hook 并同步本地用量
3. 面板将自动弹出，展示用量趋势、模型分布等数据

如未检测到 Claude / Codex 等 Agent 工具，请确认已安装并使用过至少一次。

### 桌面宠物（可选）

在面板「设置」中点击「桌面宠物」，打开 「显示桌面宠物」，提供 3 个可选的宠物

|            Click             |            Yoyo            |             Hawking              |
| :--------------------------: | :------------------------: | :------------------------------: |
| ![Click](./assets/click.png) | ![Yoyo](./assets/yoyo.png) | ![Hawking](./assets/hawking.png) |

## ⌨️ CLI 使用

需要 Node.js >= 20。安装后后台启动即可打开本地面板：

```bash
npm i -g @ai-usage-tracker/cli
ai-usage service start
# 面板: http://127.0.0.1:8452
```

国内网络较慢可用 `npm i -g @ai-usage-tracker/cli --registry=https://registry.npmmirror.com/`。完整命令、选项与数据说明见 [CLI 使用说明](./CLI.md)。

## 🔒 用户隐私协议

本产品采用本地优先架构，数据默认仅存储于您的设备。

- 📊 **本地采集**：Token 用量、模型名称、来源渠道（仅本机存储）
- 🚫 **绝不收集**：对话内容、Prompt 文本、主机名、项目名、API Key
- 🔐 **存储安全**：本地数据存储在 `~/.ai-usage/`
- 🎛️ **您的控制**：随时可删除本地数据目录清除全部记录

> 本产品不会将您的任何用量数据上报到云端。

具体内容前往点击查看用户隐私协议: 《用户隐私协议》

## 🤝 贡献指南

源码按 Desktop / CLI / Web 三端贡献。分支规范与本地启动见 [Contributing Guide](./CONTRIBUTING.md)。

- [Desktop](./CONTRIBUTING.md#desktop) — Electron 桌面端
- [CLI](./CONTRIBUTING.md#cli) — 命令行与本地面板
- [Web](./CONTRIBUTING.md#web) — 线上看板

## 📚 参考项目

- [Token Tracker](https://github.com/xiufengsun/TokenTracker): 自动采集 30 款 AI 编码工具 的 token 用量，用一套漂亮的 Dashboard 看真实成本与趋势。
- [vibe-usage](https://github.com/vibe-cafe/vibe-usage): Token 使用量统计工具（CLI）
- [OpenUsage](https://github.com/robinebers/openusage): The Only AI Usage Tracker That's Truly Yours
- [models.dev](https://models.dev): 模型 Token 计价数据源，内置计价表由此增量同步