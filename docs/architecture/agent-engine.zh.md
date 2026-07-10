# Agent 引擎

Agent 引擎位于 [`crates/agent/`](../../crates/agent/)，后端主要通过
[`openhub-ai-agent`](../../crates/backend/openhub-ai-agent/) 消费它。本页是
当前 workspace 的实现地图，不再是抽离独立仓库的计划。

## Crate 地图

| Crate | 职责 |
| --- | --- |
| `openhub-types` | Provider 无关的消息、工具类型、压缩类型、文件状态、skill 类型与 spawner 类型。 |
| `openhub-protocol` | Host/agent 命令与事件协议，以及工具审批状态。 |
| `openhub-compact` | 上下文压缩与消息窗口整理。 |
| `openhub-config` | 运行时、provider、profile、auth 配置。 |
| `openhub-providers` | Anthropic、OpenAI-compatible、Bedrock、Vertex，以及共享的流式、重试、provider 逻辑。 |
| `openhub-tools` | 内置工具与工具注册表原语。 |
| `openhub-mcp` | MCP client、manager、transports 与工具代理。 |
| `openhub-skills` | Skill 发现、frontmatter、加载与 skill-index 支持。 |
| `openhub-memory` | 记忆存储与检索原语。 |
| `openhub-agent` | 核心 engine loop、session、压缩粘合、confirmations、output sinks、skill tool、requirement tools 与 subagent spawning。 |
| `openhub-cli` | 使用同一引擎的独立 `nomi` CLI。 |
| `openhub-computer` | 桌面 computer-use 工具实现。 |
| `openhub-a11y` | computer-use 流程使用的 accessibility helper。 |
| `openhub-browser-engine` | 自托管 browser/CDP 自动化引擎。 |
| `openhub-browser` | Browser-use 工具 facade。 |

Agent crates 不依赖 `openhub-*` 后端 crate。常规的后端到 agent 集成通过
`openhub-ai-agent` 进入；`openhub-app` 与 `openhub-gateway` 中 feature-gated
的桥接面会直接依赖 browser/computer-use crate，以便把这些能力暴露为 stdio
或公开工具。

## Runtime Families

OpenHub 支持几类运行时：

- **Nomi engine**：来自 `openhub-agent` 的仓内引擎，带 provider、内置工具、
  skills、MCP、memory、browser 与 computer-use 支持。
- **ACP-style CLI agents**：Claude Code、Codex、Gemini CLI、Qwen/OpenCode
  风格集成及相关 CLI，由 `openhub-ai-agent` 管理。
- **Remote/Open capability surfaces**：外部 agent 通过 companion-token 认证的
  `/mcp`、`/mcp-agent` 或 `/v1` 入口连接。

Factory 行为的源码真相来源：

- `crates/backend/openhub-ai-agent/src/factory/nomi.rs`
- `crates/backend/openhub-ai-agent/src/factory/acp.rs`
- `crates/backend/openhub-ai-agent/src/factory/acp_assembler.rs`

## MCP 与工具注入

MCP / tool 可用性按运行时与 session 组装，不是一张全局扁平列表。

常见来源包括：

- 来自 `openhub-mcp` 的用户配置 MCP server 行；
- AutoWork 需要时注入的 requirement declaration tools；
- session 绑定知识库时注入的 scoped knowledge search；
- 带 desktop-gateway 权限的 session 使用的 Desktop Gateway tools；
- Windows/open helper bridge；
- feature-gated computer-use 与 browser-use stdio bridges；
- runtime-native skills 或 first-message skill injection；
- Nomi 原生工具注册表。

记录工具可用性时应引用上面的 factory 文件，不要假设所有 agent 都拿到同一组
injected servers。

## Skills

Skills 是 instruction/tool bundle，其物化方式取决于运行时能力：

- Nomi 在引擎内有真实的 `Skill` tool 路径。
- Native CLI 运行时可能接收 symlink/copy 出来的 skill 文件，或在支持较弱时接收
  first-message guidance。
- Custom workspace 或非 native 路径可以收到 first-message skill index 摘要。

相关源码：

- `crates/backend/openhub-extension/src/skill_service.rs`
- `crates/backend/openhub-ai-agent/src/capability/skill_manager/mod.rs`
- `crates/backend/openhub-ai-agent/src/capability/first_message_injector.rs`
- `crates/agent/openhub-agent/src/skill_tool.rs`

## Session Flow

```text
UI request
  -> openhub-conversation route/service
  -> openhub-ai-agent AgentService / WorkerTaskManager
  -> runtime family factory
  -> Nomi engine or external CLI process
  -> AgentStreamEvent
  -> openhub-realtime /ws
  -> renderer stream handlers
```

Nomi-engine session 在进程内运行。ACP-style session 会 spawn 并管理子 CLI。
公开 remote capability 调用通过 `openhub-public` 与 Desktop Gateway registry
进入，而不是通过 conversation HTTP route。

## Design Notes

旧 specs 会把 agent 层描述为“可机械抽离”并只列 11 个 crates。那些文件属于
历史资料。当前代码仍保持强边界，但 browser/computer bridge 与 public gateway
surfaces 意味着真实规则是“主接缝 + 明确记录的 feature-gated exceptions”。
