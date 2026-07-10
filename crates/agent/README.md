# crates/agent

AI agent engine crates. Package names use the `openhub-*` prefix.

Current crates:

| Crate | Role |
| --- | --- |
| `openhub-types` | Provider-neutral data types. |
| `openhub-protocol` | Host/agent command and event protocol. |
| `openhub-compact` | Conversation compaction and context shaping. |
| `openhub-config` | Provider, auth, hook, and runtime configuration. |
| `openhub-providers` | LLM provider clients and streaming logic. |
| `openhub-tools` | Built-in tool registry. |
| `openhub-mcp` | MCP client, config, transports, and tool proxying. |
| `openhub-skills` | Skill discovery, loading, and execution support. |
| `openhub-memory` | Long-term project/user memory. |
| `openhub-agent` | Core session engine and orchestration. |
| `openhub-cli` | Standalone `openhub` CLI. |
| `openhub-computer` | Desktop computer-use tool implementation. |
| `openhub-a11y` | Accessibility helpers used by computer-use flows. |
| `openhub-browser-engine` | Self-hosted browser/CDP automation engine. |
| `openhub-browser` | Browser-use tool layer. |

## Boundary

- `crates/agent` must not depend on `openhub-*` backend crates.
- Backend access to the agent layer should pass through
  `crates/backend/openhub-ai-agent`.
- Shared utilities that genuinely belong on both sides live under
  `crates/shared`.

The old extraction checklist in `docs/specs/agent-extraction-checklist.md` is a
historical aid. Re-check it against the current crate list before using it as an
execution plan.
