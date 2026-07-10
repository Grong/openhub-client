# 项目结构

这是 **OpenHub** 的当前仓库地图。后端分层详见
[`../architecture/backend-crates.md`](../architecture/backend-crates.md)，运行时总览见
[`../architecture/overview.md`](../architecture/overview.md)。

## 顶层布局

```text
openhub-client/
├── apps/
│   ├── web/                      openhub-web：独立 Web/API host
│   └── desktop/                  openhub-desktop：Tauri 桌面壳
├── crates/
│   ├── agent/                    15 个 openhub-* crate，AI agent 引擎
│   ├── backend/                  29 个 openhub-* crate，HTTP/WS 后端
│   └── shared/                   2 个真正跨层共享 crate
├── ui/                           React SPA，Vite + UnoCSS，唯一 Bun workspace
├── docs/                         当前文档、历史设计、审计与归档说明
├── packaging/linux/              openhub-web systemd unit 与部署说明
├── Cargo.toml                    Rust workspace
├── package.json                  Bun/Tauri/Cargo 入口脚本
├── Dockerfile                    openhub-web 容器镜像
├── docker-compose.yml            Web host compose 示例
├── Caddyfile                     可选 TLS reverse proxy
├── README.md
└── STATUS.md
```

Cargo workspace 当前成员：

```toml
members = ["crates/agent/*", "crates/backend/*", "crates/shared/*", "apps/web", "apps/desktop"]
```

## App Host

| 路径 | Binary | 职责 |
| --- | --- | --- |
| [`apps/web`](../../apps/web) | `openhub-web` | 独立 Web/API host。进程内启动 `openhub-app`，同端口提供 API、WebSocket 和 SPA。默认开启登录；`--insecure-no-auth` 仅供可信本地开发。 |
| [`apps/desktop`](../../apps/desktop) | `openhub-desktop` | Tauri 桌面壳。进程内启动同一个后端，选择空闲 localhost 端口，注入 `window.__backendPort` 与 `window.__nomiLocalTrust`，WebView 通过本地信任 token 访问后端。 |

两个 host 都直接链接 `openhub-app`。`nomicore` 仍作为 `openhub-app` 的独立
binary 存在，用于诊断、stdio MCP bridge、公开能力调用和无头场景；桌面/Web host
不会 spawn 它。

## Crate 分组

| 目录 | 前缀 | 数量 | 职责 |
| --- | --- | --- | --- |
| [`crates/agent/`](../../crates/agent) | `openhub-*` | 15 | AI agent 引擎，尽量保持独立。 |
| [`crates/backend/`](../../crates/backend) | `openhub-*` | 29 | HTTP/WS 后端、数据层、认证、会话、cron、knowledge、terminal、companion、public gateway 等。 |
| [`crates/shared/`](../../crates/shared) | mixed | 2 | 真正跨 agent/backend 使用的共享工具。 |

## Agent 层接缝

后端代码需要 agent 类型或执行能力时，默认应通过
[`crates/backend/openhub-ai-agent`](../../crates/backend/openhub-ai-agent)。
它再导出常用的 `openhub_config`、`openhub_types` 和 `RequirementSink`。

当前 workspace 仍存在少数 feature-gated 直接依赖例外：`openhub-app` 与
`openhub-gateway` 为 browser/computer-use bridge 工具直接触达部分 `openhub-*`
crate。新增后端 crate 时不要随手添加 `openhub-*` 依赖；若确实是 bridge/facade
例外，需要用 feature gate 并在架构文档中说明。

## 关键目录

| 路径 | 内容 |
| --- | --- |
| [`ui/src/common/`](../../ui/src/common) | 跨 host 的 API client、类型、adapter、工具函数。 |
| [`ui/src/platform/`](../../ui/src/platform) | host bridge：storage、logger、theme、平台能力。 |
| [`ui/src/renderer/`](../../ui/src/renderer) | 页面、组件、hooks、服务、样式和 renderer 入口。 |
| [`ui/src/common/utils/shims/`](../../ui/src/common/utils/shims) | renderer-safe 兼容 shim 与构建别名目标。 |
| [`docs/getting-started/`](../getting-started) | 安装与首次运行。 |
| [`docs/guides/`](../guides) | 用户任务指南。 |
| [`docs/architecture/`](../architecture) | 当前架构说明。 |
| [`docs/reference/`](../reference) | 配置、API、FAQ、troubleshooting。 |

## 制品位置

| 构建 | 输出 |
| --- | --- |
| `bun run build:ui` | `ui/dist/` |
| `cargo build -p openhub-web` | `target/<profile>/openhub-web` |
| `cargo build -p openhub-app --bin nomicore` | `target/<profile>/nomicore` |
| `bun run build` | `target/<profile>/bundle/<format>/...` |
| `docker compose build` | 本地镜像 `openhub-web:local` |

更多打包细节见 [`building-and-packaging.zh.md`](building-and-packaging.zh.md)。
