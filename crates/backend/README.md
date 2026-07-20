# crates/backend

Backend crates. Package names use the `openhub-*` prefix. Together these crates
provide the HTTP/WS server, data layer, auth, conversations, MCP/skills,
knowledge, requirements/AutoWork, terminal sessions, companions, public
capability gateway, and app composition.

The current backend group contains 29 crates. The most important entry points
are:

| Crate | Role |
| --- | --- |
| `openhub-app` | Composition root, CLI, bootstrap, service graph, router assembly, and embedded-server helpers. |
| `openhub-db` | SQLite, migrations, repository traits, and repository implementations. |
| `openhub-api-types` | Shared HTTP/WS request and response types. |
| `openhub-auth` | JWT, local trust, CSRF, auth routes, QR login, and security middleware. |
| `openhub-conversation` | Conversation/message service and agent stream relay. |
| `openhub-ai-agent` | Single bridge into `crates/agent`; agent factory, registry, ACP/session management, worker tasks. |
| `openhub-mcp` | MCP server config, OAuth, adapters, sync, and connection tests. |
| `openhub-extension` | Extension, skill, assistant contribution, and hub plumbing. |
| `openhub-requirement` | Requirements Platform and AutoWork orchestration. |
| `openhub-terminal` | PTY-backed terminal sessions. |
| `openhub-knowledge` | Knowledge bases and scoped knowledge MCP server. |
| `openhub-companion` | Desktop companions and companion memory/persona state. |
| `openhub-gateway` | Desktop Gateway MCP tools exposed to internal and external agents. |
| `openhub-public` | Companion-token authenticated `/mcp`, `/mcp-agent`, and `/v1` public front doors. |

See `docs/architecture/backend-crates.md` for the maintained map.

## Agent Boundary

Only `openhub-ai-agent` should depend directly on `openhub-*` crates. Other backend
crates consume agent-facing types through its re-exports, for example
`openhub_ai_agent::{openhub_config, openhub_types, RequirementSink}`.

This keeps the agent layer isolated enough to reason about, but the older
`openhub-agent-rs` extraction language in historical specs is not a current
roadmap commitment.
