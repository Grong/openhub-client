# Agent Engine

The agent engine lives under [`crates/agent/`](../../crates/agent/) and is
consumed by the backend primarily through
[`openhub-ai-agent`](../../crates/backend/openhub-ai-agent/). This page is an
implementation map for the current workspace, not an extraction plan.

## Crate Map

| Crate | Responsibility |
| --- | --- |
| `openhub-types` | Provider-neutral messages, tool types, compaction types, file state, skill types, and spawner types. |
| `openhub-protocol` | Host/agent command and event protocol plus approval state. |
| `openhub-compact` | Context compaction and message-window shaping. |
| `openhub-config` | Runtime/provider/profile/auth configuration. |
| `openhub-providers` | Anthropic, OpenAI-compatible, Bedrock, Vertex, and shared streaming/retry/provider logic. |
| `openhub-tools` | Built-in tools and tool registry primitives. |
| `openhub-mcp` | MCP client, manager, transports, and tool proxying. |
| `openhub-skills` | Skill discovery, frontmatter, loading, and skill-index support. |
| `openhub-memory` | Memory storage and retrieval primitives. |
| `openhub-agent` | Core engine loop, sessions, compaction glue, confirmations, output sinks, skill tool, requirement tools, and subagent spawning. |
| `openhub-cli` | Standalone `openhub` CLI consumer of the engine. |
| `openhub-computer` | Desktop computer-use tool implementation. |
| `openhub-a11y` | Accessibility helpers for computer-use flows. |
| `openhub-browser-engine` | Self-hosted browser/CDP automation engine. |
| `openhub-browser` | Browser-use tool facade. |

The agent crates do not depend on `openhub-*` backend crates. Backend-to-agent
integration normally flows through `openhub-ai-agent`; feature-gated bridge
surfaces in `openhub-app` and `openhub-gateway` directly depend on browser and
computer-use crates to expose those capabilities as stdio/public tools.

## Runtime Families

OpenHub supports several runtime families:

- **Nomi engine**: in-tree engine from `openhub-agent`, with providers, built-in
  tools, skills, MCP, memory, browser, and computer-use support.
- **ACP-style CLI agents**: Claude Code, Codex, Gemini CLI, Qwen/OpenCode-style
  integrations, and related CLIs managed by `openhub-ai-agent`.
- **Remote/Open capability surfaces**: external agents connect through
  companion-token authenticated `/mcp`, `/mcp-agent`, or `/v1` fronts.

The implementation source of truth for factory behavior is:

- `crates/backend/openhub-ai-agent/src/factory/openhub.rs`
- `crates/backend/openhub-ai-agent/src/factory/acp.rs`
- `crates/backend/openhub-ai-agent/src/factory/acp_assembler.rs`

## MCP And Tool Injection

MCP/tool availability is assembled per runtime and per session. It is not a
single flat list.

Common sources include:

- user-configured MCP server rows from `openhub-mcp`,
- requirement declaration tools when AutoWork requires them,
- scoped knowledge search when a session has mounted knowledge bases,
- Desktop Gateway tools for sessions flagged with desktop-gateway access,
- Windows/open helper bridge,
- feature-gated computer-use and browser-use stdio bridges,
- runtime-native skills or first-message skill injection,
- Nomi's native tool registry.

When documenting tool availability, cite the factory files above rather than
assuming all agents receive the same injected servers.

## Skills

Skills are instruction/tool bundles whose materialization depends on runtime
capability:

- Nomi has a real `Skill` tool path in the engine.
- Native CLI runtimes may receive symlinked/copied skill files or lightweight
  first-message guidance when the runtime supports it.
- Custom workspace or non-native paths can be summarized in a first-message
  skill index.

Relevant source files:

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

Nomi-engine sessions run inside the process. ACP-style sessions spawn and manage
child CLIs. Public remote capability calls enter through `openhub-public` and
the Desktop Gateway registry rather than the conversation HTTP route.

## Design Notes

Older specs describe the agent layer as mechanically extraction-ready and list
only 11 crates. Those files are historical. The current code still keeps a
strong boundary, but browser/computer bridge work and public gateway surfaces
mean the real rule is “primary seam plus documented feature-gated exceptions.”
